import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
const isProd = process.env.NODE_ENV === "production";


import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/tokens.js";

import {
  generateEmailVerificationToken,
  hashEmailToken,
} from "../utils/emailVerification.js";

import { sendVerificationEmail } from "../utils/sendEmail.js";

/**
 * POST /auth/signup
 * body: { email, password }
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // 🔐 Email verification token
    const verificationToken = generateEmailVerificationToken();
    const tokenHash = hashEmailToken(verificationToken);

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // 📧 Send real verification email
    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      message: "Signup successful. Please verify your email.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /auth/login
 * body: { email, password }
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔑 Tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: isProd?"none":"strict",
      secure: false, // true in prod
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /auth/refresh
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const tokenHash = hashToken(refreshToken);

    const session = await prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // 🔄 Rotate refresh token
    const newRefreshToken = generateRefreshToken();

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: isProd ? "none":"strict",
      secure: isProd,
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = generateAccessToken(session.userId);

    return res.json({ accessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({ message: "Already logged out" });
    }

    const tokenHash = hashToken(refreshToken);

    await prisma.session.deleteMany({
      where: { refreshTokenHash: tokenHash },
    });

    res.clearCookie("refreshToken", {
      path: "/auth",
      httpOnly: true,
      sameSite: isProd?"none":"strict",
      secure: isProd,
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /auth/verify-email?token=...
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid token" });
    }

    const tokenHash = hashEmailToken(token);

    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired or invalid" });
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    await prisma.emailVerificationToken.delete({
      where: { id: record.id },
    });

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
