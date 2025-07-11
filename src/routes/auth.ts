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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 verifiedEmail:
 *                   type: boolean
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

/**
 * @openapi
 * /auth/send-email-confirmation:
 *   post:
 *     summary: "Enviar confirmação de e-mail"
 *     description: "Envia um e-mail de confirmação para o usuário."
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: "E-mail de confirmação enviado com sucesso."
 *       400:
 *         description: "Dados inválidos."
 *       500:
 *         description: "Erro interno do servidor."
 */
router.post("/send-email-confirmation", (req, res) => {
  sendEmailConfirmation(req, res);
});

/**
 * @openapi
 * /auth/confirm-email:
 *   post:
 *     summary: "Confirmar e-mail"
 *     description: "Confirma o e-mail do usuário com base no token enviado."
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: "E-mail confirmado com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email confirmado com sucesso"
 *       400:
 *         description: "Dados inválidos."
 *       500:
 *         description: "Erro interno do servidor."
 */
router.post("/confirm-email", async (req, res) => {
  confirmEmail(req, res);
});

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: "Atualizar token de acesso"
 *     description: "Atualiza o token de acesso usando o refresh token."
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: "Token de acesso atualizado com sucesso."
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
router.post("/refresh-token", (req, res) => {
  refreshAccessToken(req, res);
});

export default router;
