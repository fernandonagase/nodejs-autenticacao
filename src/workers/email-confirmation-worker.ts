import { Worker } from "bullmq";

import { EmailConfirmationService } from "../services/email-confirmation-service.js";

const { sendConfirmationEmail } = EmailConfirmationService;

const worker = new Worker(
  "email",
  async (job) => {
    const { email, token } = job.data;
    if (job.name === "send-welcome-email") {
      const sendEmailResult = await sendConfirmationEmail(email, token);
      if (!sendEmailResult.ok) {
        throw new Error(sendEmailResult.error ?? "Erro desconhecido");
      }
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  },
);

worker.on("failed", (_, err) => {
  console.error(`Erro ao enviar e-mail:`, err);
});
