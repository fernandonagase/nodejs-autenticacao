import express from "express";

import { signup, signin } from "../controllers/auth-controller.js";

const router = express.Router();

router.use(express.json());

router.post("/signup", (req, res) => {
  signup(req, res);
});

router.post("/signin", (req, res) => {
  signin(req, res);
});

export default router;
