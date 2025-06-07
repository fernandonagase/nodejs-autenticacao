import { Result } from "../../tools/result.js";
import { EmailConfirmation } from "../email-confirmation/email-confirmation.type.js";

export interface IEmailConfirmationAuthority {
  issue(email: string, secret: string): Result<EmailConfirmation>;
  validate(
    token: string,
    secret: string,
  ): Result<{ isValid: boolean; payload?: EmailConfirmation }>;
}
