import { EmailConfirmation } from "../../domain/email-confirmation/email-confirmation.type.js";
import { Result } from "../../tools/result.js";

export interface IEmailConfirmationRepository {
  createEmailConfirmation(
    emailConfirmation: EmailConfirmation,
  ): Promise<Result<void>>;
}
