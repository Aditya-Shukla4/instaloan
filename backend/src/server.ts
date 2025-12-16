import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import app from "./app.js";

// 🔑 ENV
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// 🛡️ BODY SIZE LIMIT (SECURITY)
app.use(express.json({ limit: "10kb" }));

// 🌐 CORS (REQUIRED FOR AUTH COOKIES)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🔥 GLOBAL ERROR HANDLER (DEPLOY DEBUG LIFE-SAVER)
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});
