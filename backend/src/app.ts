import express from "express";
import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
