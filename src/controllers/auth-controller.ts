import { Request, Response } from "express";

import {
  signup as doSignup,
  signin as doSignin,
  signin2 as doSignin2,
  issueConfirmationToken,
} from "../services/auth-service.js";
import { EmailConfirmationService } from "../services/email-confirmation-service.js";
import { userToResource } from "../resources/user-resource.js";

const { confirmUserEmail } = EmailConfirmationService;

async function signup(req: Request, res: Response) {
  const { username, firstname, email, password } = req.body;
  if (!username || !firstname || !email || !password) {
    return res.status(400).json({
      error: "Campos username, firstname, email e password obrigatórios",
    });
  }
  const result = await doSignup(username, firstname, email, password);
  if (!result.ok) {
    return res.status(500).json({
      error: result.error,
    });
  }
  res.status(201).json(userToResource(result.data));
}

async function signin(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: "Campos username e password obrigatórios",
    });
  }
  const result = await doSignin(username, password);
  if (!result.ok) {
    return res.status(500).json({
      error: result.error,
    });
  }
  res.status(200).json({ token: result.data });
}

async function signin2(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: "Campos username e password obrigatórios",
    });
  }
  const result = await doSignin2(username, password);
  if (!result.ok) {
    return res.status(500).json({
      error: result.error,
    });
  }
  const { accessToken, refreshToken } = result.data;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true, // Use true em produção (HTTPS)
    sameSite: "strict",
  });
  res.status(200).json({ token: accessToken });
}

async function sendEmailConfirmation(req: Request, res: Response) {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({
      error: "Campo userId obrigatório",
    });
  }
  const emailConfirmationToken = await issueConfirmationToken(userId);
  if (!emailConfirmationToken.ok) {
    return res.status(500).json({
      error: "Não foi possível enviar a confirmação de email",
    });
  }
  res.status(200).json({ token: emailConfirmationToken.data });
}

async function confirmEmail(req: Request, res: Response) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      error: "Campo token obrigatório",
    });
  }
  const result = await confirmUserEmail(token);
  if (!result.ok) {
    return res.status(500).json({
      error: result.error,
    });
  }
  res.status(200).json({ message: "Email confirmado com sucesso" });
}

export { signup, signin, signin2, sendEmailConfirmation, confirmEmail };
