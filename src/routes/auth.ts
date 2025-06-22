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
