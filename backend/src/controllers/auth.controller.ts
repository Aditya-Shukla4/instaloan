import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/tokens.js";


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

    return res.status(201).json({
      id: user.id,
      email: user.email,
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

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 1️⃣ Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    // 2️⃣ Store hashed refresh token in DB
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // 3️⃣ Set HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production (HTTPS)
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4️⃣ Send access token only
    return res.json({ accessToken });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const tokenHash = hashToken(refreshToken);

    const session = await prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (session.expiresAt < new Date()) {
      // cleanup
      await prisma.session.delete({
        where: { id: session.id },
      });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // 🔄 ROTATE refresh token (best practice)
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
      sameSite: "strict",
      secure: false, // true in prod
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

//LOGIC FOR LOG OUT
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
      httpOnly:true,
      sameSite:"strict",
      secure:false,
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
