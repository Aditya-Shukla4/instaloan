import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";

const app = express();

// 🔒 Body size limit
app.use(express.json({ limit: "10kb" }));

// 🍪 Cookies
app.use(cookieParser());

// 🌐 CORS (required for auth cookies)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// 🚏 Routes
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

// ❤️ Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 🔥 Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("🔥 Global error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
