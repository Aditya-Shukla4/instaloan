import crypto from "crypto";

export function generateEmailVerificationToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashEmailToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
