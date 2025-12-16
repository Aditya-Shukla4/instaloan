import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// 🚨 Fail fast if env missing (deploy safety)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// 🧠 Reuse pool across hot reloads / serverless
const globalForPg = globalThis as unknown as {
  pgPool?: pg.Pool;
};

const pool =
  globalForPg.pgPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

// 🧠 Reuse Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
