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

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     summary: "Fazer login"
 *     deprecated: true
 *     description: |
 *       Gera um token JWT com base em usuário e senha.
 *       Esta rota foi deprecada porque agora utilizamos refresh tokens para maior segurança.
 *       Utilize a rota `/v2/signin` no lugar desta.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Autenticação feita com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: "Dados inválidos."
 *       500:
 *         description: "Erro interno do servidor."
 */
router.post("/signin", (req, res) => {
  signin(req, res);
});

/**
 * @openapi
 * /auth/v2/signin:
 *   post:
 *     summary: "Fazer login"
 *     description: "Gera um token JWT com base em usuário e senha."
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Autenticação feita com sucesso."
 *         headers:
 *           Set-Cookie:
 *             description: "Cookie de refresh token definido."
 *             schema:
 *               type: string
 *               example: refreshToken=abcde12345; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: "Dados inválidos."
 *       500:
 *         description: "Erro interno do servidor."
 */
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
