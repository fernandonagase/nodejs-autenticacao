import express from "express";

import {
  signup,
  signin,
  sendEmailConfirmation,
} from "../controllers/auth-controller.js";

const router = express.Router();

router.use(express.json());

router.post("/signup", (req, res) => {
  signup(req, res);
});

router.post("/signin", (req, res) => {
  signin(req, res);
});

router.post("/confirm-email", (req, res) => {
  sendEmailConfirmation(req, res);
});

export default router;
