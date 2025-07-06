import { Result } from "../../tools/result2.js";
import { EmailConfirmation } from "../email-confirmation/email-confirmation.type.js";

export interface IEmailConfirmationAuthority {
  issueToken(userId: number, secret: string): Result<EmailConfirmation>;
  validateToken(
    token: string,
    secret: string,
  ): Result<{ isValid: boolean; payload?: EmailConfirmation }>;
}
