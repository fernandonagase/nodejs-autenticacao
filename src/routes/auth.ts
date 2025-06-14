import express from "express";

import {
  signup,
  signin,
  sendEmailConfirmation,
  confirmEmail,
} from "../controllers/auth-controller.js";

const router = express.Router();

router.use(express.json());

router.post("/signup", (req, res) => {
  signup(req, res);
});

router.post("/signin", (req, res) => {
  signin(req, res);
});

router.post("/send-email-confirmation", (req, res) => {
  sendEmailConfirmation(req, res);
});

router.post("/confirm-email", async (req, res) => {
  confirmEmail(req, res);
});

export default router;
