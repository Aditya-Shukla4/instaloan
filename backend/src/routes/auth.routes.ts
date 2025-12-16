import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";

const router = Router();

/**
 * POST /auth/signup
 * Body: { email, password }
 */
router.post("/signup", signup);

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post("/login", login);

export default router;
