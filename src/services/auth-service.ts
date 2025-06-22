import crypto from "crypto";

import { User, UserWithId } from "../domain/user/user.js";
import { UserRepository } from "../persistence/user-repository.js";
import { Argon2idHasher } from "../tools/argon2idHasher.js";
import { Result } from "../tools/result.js";
import {
  Result as Result2,
  resultFailure,
  resultSuccess,
} from "../tools/result2.js";
import { JwtEmailConfirmationAuthority } from "../domain/email-confirmation/jwt-email-confirmation-authority.js";
import { EmailConfirmationRepository } from "../persistence/email-confirmation-repository.js";
import { emailQueue } from "../queues/email-queue.js";
import { RefreshTokenRepository } from "../persistence/refresh-token-repository.js";

const { issueToken } = JwtEmailConfirmationAuthority;
const { createEmailConfirmation } = EmailConfirmationRepository;
const { createRefreshToken, findRefreshTokenByHash, updateRefreshToken } =
  RefreshTokenRepository;

interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

async function signup(
  username: string,
  firstname: string,
  email: string,
  password: string,
): Promise<Result2<UserWithId>> {
  const now = new Date();
  const user = new User(
    username,
    firstname,
    email,
    now,
    now,
    new Argon2idHasher(),
  );
  const result = await user.setPassword(password);
  if (!result.ok) {
    return resultFailure(result.error ?? "Falha ao criar usuário");
  }
  const userRepository = new UserRepository();
  const userResult = await userRepository.create(user);
  if (!userResult.ok) {
    return resultFailure(userResult.error ?? "Falha ao criar usuário");
  }
  if (!userResult.data) {
    return resultFailure("Não foi possível obter os dados do usuário");
  }
  const emailConfirmationToken = await issueConfirmationToken(
    userResult.data.id,
  );
  if (!emailConfirmationToken.ok || !emailConfirmationToken.data) {
    return resultFailure(
      emailConfirmationToken.error ??
        "Não foi possível emitir o token de confirmação",
    );
  }

  await emailQueue.add("send-welcome-email", {
    email: userResult.data.email,
    token: emailConfirmationToken.data,
  });

  return resultSuccess(userResult.data);
}

async function emitNewTokens(user: UserWithId) {
  if (!process.env.JWT_SECRET) {
    return resultFailure("JWT_SECRET não está definido");
  }
  const jwtResult = user.issueJWT(process.env.JWT_SECRET);
  if (!jwtResult.ok || !jwtResult.data) {
    return resultFailure(
      jwtResult.error ?? "Não foi possível renovar o token de acesso",
    );
  }
  const refreshTokenResult = await registerRefreshToken(user);
  if (!refreshTokenResult.ok) {
    return resultFailure(refreshTokenResult.error);
  }
  return resultSuccess({
    accessToken: jwtResult.data,
    refreshToken: refreshTokenResult.data,
  });
}

async function signin(
  username: string,
  password: string,
): Promise<Result<string>> {
  const userRepository = new UserRepository();
  const userResult = await userRepository.findByUsername(username);
  if (!userResult.ok || !userResult.data) {
    return Result.failure(
      userResult.error ?? "Nome de usuário ou senha incorretos",
    );
  }
  const validationResult = await userResult.data.validatePassword(password);
  if (!validationResult.ok || !validationResult.data) {
    return Result.failure("Nome de usuário ou senha incorretos");
  }
  const genericErrorMessage =
    "Não foi possível fazer login, tente novamente mais tarde";
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET não está definido");
    return Result.failure(genericErrorMessage);
  }
  const jwtResult = userResult.data.issueJWT(process.env.JWT_SECRET);
  if (!jwtResult.ok || !jwtResult.data) {
    console.error("Erro ao emitir JWT:", jwtResult.error);
    return Result.failure(genericErrorMessage);
  }
  return Result.success(jwtResult.data);
}

// Função utilizada para atender a rota /v2/signin
// utiliza o conceito de refresh/access token
async function signin2(
  username: string,
  password: string,
): Promise<Result2<TokensResponse>> {
  const userRepository = new UserRepository();
  const invalidCredentialsMessage = "Nome de usuário ou senha incorretos";
  const userResult = await userRepository.findByUsername(username);
  if (!userResult.ok || !userResult.data) {
    console.error(userResult.error);
    return resultFailure(invalidCredentialsMessage);
  }
  const passwordValidationResult =
    await userResult.data.validatePassword(password);
  if (!passwordValidationResult.ok || !passwordValidationResult.data) {
    console.error(passwordValidationResult.error);
    return resultFailure(invalidCredentialsMessage);
  }
  const tokensResult = await emitNewTokens(userResult.data);
  if (!tokensResult.ok) {
    return resultFailure(`Erro ao emitir tokens: ${tokensResult.error}`);
  }
  return resultSuccess({
    accessToken: tokensResult.data.accessToken,
    refreshToken: tokensResult.data.refreshToken,
  });
}

async function issueConfirmationToken(userId: number): Promise<Result<string>> {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET não está definido");
    return Result.failure("Não foi possível emitir o token de confirmação");
  }
  const userRepository = new UserRepository();
  const userResult = await userRepository.findById(userId);
  if (!userResult.ok || !userResult.data) {
    console.error("Usuário não encontrado:", userResult.error);
    return Result.failure("Usuário não encontrado");
  }
  console.log(userResult.data);
  if (userResult.data.verifiedEmail) {
    console.error("E-mail já confirmado.");
    return Result.failure("E-mail já confirmado.");
  }
  const tokenResult = issueToken(userId, process.env.JWT_SECRET);
  if (!tokenResult.ok || !tokenResult.data) {
    console.error("Erro ao emitir token de confirmação:", tokenResult.error);
    return Result.failure("Não foi possível emitir o token de confirmação");
  }
  const createResult = await createEmailConfirmation(tokenResult.data);
  if (!createResult.ok) {
    console.error("Erro ao criar confirmação de email:", createResult.error);
    return Result.failure("Não foi possível emitir o token de confirmação");
  }
  return Result.success(tokenResult.data.token);
}

async function registerRefreshToken(
  user: UserWithId,
): Promise<Result2<string>> {
  const refreshTokenResult = user.issueRefreshToken();
  if (!refreshTokenResult.ok) {
    return resultFailure(refreshTokenResult.error);
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshTokenResult.data)
    .digest("hex");
  const refreshTokenDatabaseResult = await createRefreshToken(
    hashedToken,
    user.id,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ); // Expira em 30 dias
  if (!refreshTokenDatabaseResult.ok) {
    console.error(
      "Erro ao criar refresh token no banco de dados:",
      refreshTokenDatabaseResult.error,
    );
    return resultFailure("Não foi possível registrar o refresh token");
  }
  return resultSuccess(refreshTokenResult.data);
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<Result2<TokensResponse>> {
  const refreshTokenResult = await findRefreshTokenByHash(
    crypto.createHash("sha256").update(refreshToken).digest("hex"),
  );
  if (!refreshTokenResult.ok) {
    return resultFailure(refreshTokenResult.error);
  }
  const now = new Date();
  // esse tipo de logica - ex.: esta expirado ou revogado - poderia estar em uma classe de modelo
  if (
    !refreshTokenResult.data ||
    refreshTokenResult.data.expiresAt < now ||
    (refreshTokenResult.data.revokedAt &&
      refreshTokenResult.data.revokedAt < now)
  ) {
    return resultFailure("Refresh token inválido ou expirado");
  }
  const userRepository = new UserRepository();
  const userResult = await userRepository.findById(
    refreshTokenResult.data.userId,
  );
  if (!userResult.ok || !userResult.data) {
    return resultFailure(userResult.error ?? "Usuário não encontrado");
  }
  const tokensResult = await emitNewTokens(userResult.data);
  if (!tokensResult.ok) {
    return resultFailure(tokensResult.error);
  }
  refreshTokenResult.data.revokedAt = new Date();
  const updateResult = await updateRefreshToken(refreshTokenResult.data);
  if (!updateResult.ok) {
    return resultFailure(updateResult.error);
  }
  return resultSuccess(tokensResult.data);
}

export { signup, signin, signin2, issueConfirmationToken, refreshAccessToken };
