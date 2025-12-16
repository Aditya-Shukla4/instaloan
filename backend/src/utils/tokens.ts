import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateAccessToken(userId: string) {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
