import { join, dirname } from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

import { IEmailConfirmationService } from "./interfaces/email-confirmation-service.js";
import { Result, resultFailure, resultSuccess } from "../tools/result.js";
import { MailtrapEmailService } from "./mailtrap-email-service.js";
import { UserRepository } from "../persistence/user-repository.js";
import { JwtEmailConfirmationAuthority } from "../domain/email-confirmation/jwt-email-confirmation-authority.js";
import { EmailConfirmationRepository } from "../persistence/email-confirmation-repository.js";

const { validateToken } = JwtEmailConfirmationAuthority;
const { sendEmail } = MailtrapEmailService;
const { findEmailConfirmationByTokenId } = EmailConfirmationRepository;

const EmailConfirmationService: IEmailConfirmationService = {
  async sendConfirmationEmail(
    email: string,
    token: string,
  ): Promise<Result<void>> {
    if (!process.env.FRONTEND_URL) {
      console.error("FRONTEND_URL não está definida");
      return resultFailure("Não foi possível enviar o email de confirmação");
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
      return resultFailure("Não foi possível enviar o email de confirmação");
    }

    html = html
      .replace("{{ username }}", email)
      .replace(
        "{{ confirmationLink }}",
        `${process.env.FRONTEND_URL}/confirm-email?token=${token}`,
      );

    return sendEmail(email, "Confirmação de Email", html, { html: true });
  },

  async confirmUserEmail(token: string): Promise<Result<void>> {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não está definido");
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    const validationResult = validateToken(token, process.env.JWT_SECRET);
    if (!validationResult.ok) {
      console.error(
        "Erro ao validar token de confirmação:",
        validationResult.error,
      );
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    if (!validationResult.data.isValid || !validationResult.data.payload) {
      console.error("Token de confirmação inválido ou mal-formado");
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    const findResult = await findEmailConfirmationByTokenId(
      validationResult.data.payload.tokenId,
    );
    if (!findResult.ok) {
      console.error(
        "Erro ao buscar confirmação no banco de dados:",
        findResult.error,
      );
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    if (!findResult.data) {
      console.error("Confirmação de email não encontrada");
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    if (findResult.data.userId !== validationResult.data.payload.userId) {
      console.error(
        "Usuário do token não corresponde ao usuário da confirmação",
      );
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    if (findResult.data.revoked) {
      console.error("Token revogado");
      return resultFailure(
        "Confirmação de e-mail expirada. Por favor, solicite um novo link de confirmação.",
      );
    }
    const userRepository = new UserRepository();
    const userResult = await userRepository.findById(findResult.data.userId);
    if (!userResult.ok) {
      console.error(
        "Erro ao buscar confirmação no banco de dados:",
        userResult.error,
      );
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    if (!userResult.data) {
      console.error("Usuário não encontrado");
      return resultFailure("Não foi possível confirmar o email do usuário");
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
      return resultFailure("Não foi possível confirmar o email do usuário");
    }
    return resultSuccess();
  },
};

export { EmailConfirmationService };
