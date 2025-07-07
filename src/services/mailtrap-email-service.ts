import { MailtrapClient } from "mailtrap";

import { IEmailService } from "./interfaces/email-service.js";
import { Result, resultFailure, resultSuccess } from "../tools/result.js";

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
    options?: { html: boolean },
  ): Promise<Result<void>> {
    const { html = false } = options ?? {};
    const emailRequest = html
      ? {
          from: mailtrapSender,
          to: [{ email: to }],
          subject,
          html: body,
        }
      : {
          from: mailtrapSender,
          to: [{ email: to }],
          subject,
          text: body,
        };
    try {
      await mailTrapClient.send(emailRequest);
      return resultSuccess();
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      return resultFailure("Erro ao enviar email");
    }
  },
};

export { MailtrapEmailService };
