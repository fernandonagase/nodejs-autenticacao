import express from "express";

import {
  signup,
  signin,
  signin2,
  sendEmailConfirmation,
  confirmEmail,
  refreshAccessToken,
} from "../controllers/auth-controller.js";

const router = express.Router();

router.use(express.json());

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: "Cadastrar um novo usuário"
 *     description: "Esta rota permite o cadastro de um novo usuário."
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *               firstname:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Usuário cadastrado com sucesso."
 *       400:
 *         description: "Dados inválidos."
 *       500:
 *         description: "Erro interno do servidor."
 */
router.post("/signup", (req, res) => {
  signup(req, res);
});

router.post("/signin", (req, res) => {
  signin(req, res);
});

router.post("/v2/signin", (req, res) => {
  signin2(req, res);
});

router.post("/send-email-confirmation", (req, res) => {
  sendEmailConfirmation(req, res);
});

router.post("/confirm-email", async (req, res) => {
  confirmEmail(req, res);
});

router.post("/refresh-token", (req, res) => {
  refreshAccessToken(req, res);
});

export default router;
