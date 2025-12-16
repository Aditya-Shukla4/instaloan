import { Router } from "express";
import { getMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /users/me
 * Protected
 */
router.get("/me", requireAuth, getMe);

export default router;
