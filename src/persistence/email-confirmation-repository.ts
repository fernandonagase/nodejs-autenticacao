import { EmailConfirmation } from "../domain/email-confirmation/email-confirmation.type.js";
import { Result } from "../tools/result.js";
import { IEmailConfirmationRepository } from "./interfaces/email-confirmation-repository.js";
import { prisma } from "../tools/prisma.js";

const EmailConfirmationRepository: IEmailConfirmationRepository = {
  async createEmailConfirmation(
    emailConfirmation: EmailConfirmation,
  ): Promise<Result<void>> {
    try {
      await prisma.confirmacaoEmail.create({
        data: {
          id_token: emailConfirmation.tokenId,
          usuario_id: emailConfirmation.userId,
          expirado_em: new Date(emailConfirmation.exp * 1000),
        },
      });
    } catch (error) {
      console.error("Erro ao criar confirmação de email:", error);
      return Result.failure("Erro ao criar confirmação de email");
    }
    return Result.success();
  },
};

export { EmailConfirmationRepository };
