import { Result } from "../../tools/result2.js";

export interface IEmailConfirmationService {
  sendConfirmationEmail(email: string, token: string): Promise<Result<void>>;
  confirmUserEmail(token: string): Promise<Result<void>>;
}
