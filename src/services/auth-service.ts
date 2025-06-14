import { join, dirname } from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

import { User } from "../domain/user/user.js";
import { UserRepository } from "../persistence/user-repository.js";
import { Argon2idHasher } from "../tools/argon2idHasher.js";
import { Result } from "../tools/result.js";
import { JwtEmailConfirmationAuthority } from "../domain/email-confirmation/jwt-email-confirmation-authority.js";
import { EmailConfirmationRepository } from "../persistence/email-confirmation-repository.js";
import { MailtrapEmailService } from "./mailtrap-email-service.js";

const { issueToken, validateToken } = JwtEmailConfirmationAuthority;
const { createEmailConfirmation, findEmailConfirmationByTokenId } =
  EmailConfirmationRepository;
const { sendEmail } = MailtrapEmailService;

async function signup(
  username: string,
  firstname: string,
  email: string,
  password: string,
): Promise<Result<User>> {
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
    return Result.failure(result.error ?? "Falha ao criar usuário");
  }
  const userRepository = new UserRepository();
  const userResult = await userRepository.create(user);
  if (!userResult.ok) {
    return Result.failure(userResult.error ?? "Falha ao criar usuário");
  }
  if (!userResult.data) {
    return Result.failure("Não foi possível obter os dados do usuário");
  }
  const emailConfirmationToken = await issueConfirmationToken(
    userResult.data.id,
  );
  if (!emailConfirmationToken.ok || !emailConfirmationToken.data) {
    return Result.failure(
      emailConfirmationToken.error ??
        "Não foi possível emitir o token de confirmação",
    );
  }
  const sendEmailResult = await sendConfirmationEmail(
    userResult.data.email,
    emailConfirmationToken.data,
  );
  if (!sendEmailResult.ok) {
    return Result.failure(
      sendEmailResult.error ?? "Não foi possível enviar o email de confirmação",
    );
  }
  return Result.success(userResult.data);
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

async function sendConfirmationEmail(
  email: string,
  token: string,
): Promise<Result<void>> {
  if (!process.env.FRONTEND_URL) {
    console.error("FRONTEND_URL não está definida");
    return Result.failure("Não foi possível enviar o email de confirmação");
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const templatePath = join(
    __dirname,
    "../assets/templates/email-confirmation.html",
  );
  let html: string;
  try {
    html = await readFile(templatePath, "utf-8");
  } catch (error) {
    console.error("Erro ao ler template de email:", error);
    return Result.failure("Não foi possível enviar o email de confirmação");
  }

  html = html
    .replace("{{ username }}", email)
    .replace(
      "{{ confirmationLink }}",
      `${process.env.FRONTEND_URL}/confirm-email?token=${token}`,
    );

  return sendEmail(email, "Confirmação de Email", html, { html: true });
}

async function confirmUserEmail(token: string): Promise<Result<void>> {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET não está definido");
    return Result.failure("Não foi possível confirmar o email do usuário");
  }
  const validationResult = validateToken(token, process.env.JWT_SECRET);
  if (
    !validationResult.ok ||
    !validationResult.data ||
    !validationResult.data.isValid ||
    !validationResult.data.payload
  ) {
    console.error(
      "Erro ao validar token de confirmação:",
      validationResult.error,
    );
    return Result.failure("Não foi possível confirmar o email do usuário");
  }
  const findResult = await findEmailConfirmationByTokenId(
    validationResult.data.payload.tokenId,
  );
  if (!findResult.ok || !findResult.data) {
    console.error(
      "Erro ao buscar confirmação no banco de dados:",
      findResult.error,
    );
    return Result.failure("Não foi possível confirmar o email do usuário");
  }
  if (findResult.data.userId !== validationResult.data.payload.userId) {
    console.error("Usuário do token não corresponde ao usuário da confirmação");
    return Result.failure("Não foi possível confirmar o email do usuário");
  }
  if (findResult.data.revoked) {
    console.error("Token revogado");
    return Result.failure(
      "Confirmação de e-mail expirada. Por favor, solicite um novo link de confirmação.",
    );
  }
  const userRepository = new UserRepository();
  const userResult = await userRepository.findById(findResult.data.userId);
  if (!userResult.ok || !userResult.data) {
    console.error(
      "Erro ao buscar confirmação no banco de dados:",
      userResult.error,
    );
    return Result.failure("Não foi possível confirmar o email do usuário");
  }
  const user = userResult.data;
  user.verifiedEmail = true;
  const confirmationResult = await userRepository.confirmEmail(
    user.id,
    findResult.data.tokenId,
  );
  if (!confirmationResult.ok) {
    console.error(
      "Erro ao salvar estado de verificação do usuário no banco de dados:",
      confirmationResult.error,
    );
    return Result.failure("Não foi possível confirmar o email do usuário");
  }
  return Result.success();
}

export { signup, signin, issueConfirmationToken, confirmUserEmail };
