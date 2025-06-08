import { EmailConfirmation } from "../domain/email-confirmation/email-confirmation.type.js";
import { Result } from "../tools/result.js";
import {
  FindEmailConfirmationReturnType,
  IEmailConfirmationRepository,
} from "./interfaces/email-confirmation-repository.js";
import { prisma } from "../tools/prisma.js";

const EmailConfirmationRepository: IEmailConfirmationRepository = {
  async createEmailConfirmation(
    emailConfirmation: EmailConfirmation,
  ): Promise<Result<void>> {
    try {
      await prisma.$transaction([
        prisma.confirmacaoEmail.updateMany({
          where: {
            usuario_id: emailConfirmation.userId,
          },
          data: {
            revogado: true,
          },
        }),
        prisma.confirmacaoEmail.create({
          data: {
            id_token: emailConfirmation.tokenId,
            usuario_id: emailConfirmation.userId,
            expirado_em: new Date(emailConfirmation.exp * 1000),
          },
        }),
      ]);
    } catch (error) {
      console.error("Erro ao criar confirmação de email:", error);
      return Result.failure("Erro ao criar confirmação de email");
    }
    return Result.success();
  },
  async findEmailConfirmationByTokenId(
    tokenId: string,
  ): Promise<Result<FindEmailConfirmationReturnType>> {
    try {
      const emailConfirmation = await prisma.confirmacaoEmail.findUnique({
        where: { id_token: tokenId },
      });
      return Result.success(
        emailConfirmation
          ? {
              tokenId: emailConfirmation.id_token,
              userId: emailConfirmation.usuario_id,
              exp: Math.floor(emailConfirmation.expirado_em.getTime() / 1000),
              revoked: emailConfirmation.revogado,
            }
          : null,
      );
    } catch (error) {
      console.error("Erro ao buscar confirmação de email:", error);
      return Result.failure("Erro ao buscar confirmação de email");
    }
  },
};

export { EmailConfirmationRepository };
