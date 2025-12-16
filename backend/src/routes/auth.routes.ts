import { Router } from "express";
import { signup, login,refresh,logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

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

router.post("/refresh",refresh);
router.post("/logout",logout);

export default router;
