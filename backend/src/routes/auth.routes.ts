import { Router } from "express";
import {
  signup,
  login,
  refresh,
  logout,
  verifyEmail,
} from "../controllers/auth.controller.js";

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

/**
 * POST /auth/refresh
 * Uses HttpOnly refreshToken cookie
 */
router.post("/refresh", refresh);

/**
 * POST /auth/logout
 * Logs out current device
 */
router.post("/logout", logout);

/**
 * GET /auth/verify-email?token=...
 * Email verification link
 */
router.get("/verify-email", verifyEmail);

export default router;
