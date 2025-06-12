import { Result } from "../../tools/result.js";

export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<Result<void>>;
}
