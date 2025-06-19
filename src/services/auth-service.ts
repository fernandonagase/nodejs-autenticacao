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

const { issueToken } = JwtEmailConfirmationAuthority;
const { createEmailConfirmation } = EmailConfirmationRepository;

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

export { signup, signin, issueConfirmationToken };
