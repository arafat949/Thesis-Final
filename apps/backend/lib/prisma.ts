import "dotenv/config";
import { PrismaClient } from "../generated/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Resolve absolute path to the SQLite database
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.resolve(__dirname, "..", "dev.db");

const adapter = new PrismaBetterSqlite3({ url: `file:${dbFile}` });

export const prisma = new PrismaClient({ adapter });
