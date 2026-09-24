import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const apiKey = header.replace("Bearer ", "").trim();
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const merchant = await prisma.merchant.findUnique({ where: { apiKey } });
    if (!merchant) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // attach merchant to request for downstream use
    (req as any).merchant = merchant;
    return next();
  } catch (err) {
    console.error("Auth error", err);
    return res.status(500).json({ error: "Auth service error" });
  }
};
