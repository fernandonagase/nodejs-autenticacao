import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import authRouter from "./routes/auth.js";
import openapiSpecification from "./docs/swagger.js";

const app = express();

if (!process.env.FRONTEND_URL) {
  throw new Error("A variável de ambiente FRONTEND_URL não está definida.");
}

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

const PORT = process.env.PORT || 3000;

app.use("/auth", authRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Documentação em http://localhost:${PORT}/docs`);
});
