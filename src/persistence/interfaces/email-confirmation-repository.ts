import { EmailConfirmation } from "../../domain/email-confirmation/email-confirmation.type.js";
import { Result } from "../../tools/result.js";

export type FindEmailConfirmationReturnType =
  | (Omit<EmailConfirmation, "token" | "revoked"> & { revoked: boolean })
  | null;

export interface IEmailConfirmationRepository {
  createEmailConfirmation(
    emailConfirmation: EmailConfirmation,
  ): Promise<Result<void>>;
  findEmailConfirmationByTokenId(
    tokenId: string,
  ): Promise<Result<FindEmailConfirmationReturnType>>;
}
