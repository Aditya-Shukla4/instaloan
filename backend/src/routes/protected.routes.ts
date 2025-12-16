import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: (req as any).user,
  });
});

export default router;
