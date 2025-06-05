import { Request, Response } from "express";

import {
  signup as doSignup,
  signin as doSignin,
} from "../services/auth-service.js";

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
  res.status(201).json(result.data);
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

export { signup, signin };
