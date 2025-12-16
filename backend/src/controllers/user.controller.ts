import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return res.json(user);
};
