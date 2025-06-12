import { MailtrapClient } from "mailtrap";

import { IEmailService } from "./interfaces/email-service.js";
import { Result } from "../tools/result.js";

if (!process.env.MAILTRAP_API_TOKEN) {
  throw new Error(
    "MAILTRAP_API_TOKEN não está definida nas variáveis de ambiente",
  );
}

if (!process.env.EMAIL_CONFIRMATION_SENDER_EMAIL) {
  throw new Error(
    "EMAIL_CONFIRMATION_SENDER_EMAIL não está definida nas variáveis de ambiente",
  );
}

const mailTrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN,
});
const mailtrapSender = {
  name: "Mailtrap Test",
  email: process.env.EMAIL_CONFIRMATION_SENDER_EMAIL,
};

const MailtrapEmailService: IEmailService = {
  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<Result<void>> {
    try {
      await mailTrapClient.send({
        from: mailtrapSender,
        to: [{ email: to }],
        subject,
        text: body,
      });
      return Result.success();
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      return Result.failure("Erro ao enviar email");
    }
  },
};

export { MailtrapEmailService };
