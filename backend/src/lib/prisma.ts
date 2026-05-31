/**
 * lib/prisma.ts
 * Singleton PrismaClient instance.
 * Prisma v7 requires passing a driver adapter explicitly.
 * We use @prisma/adapter-better-sqlite3 for SQLite.
 */

import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = path.join(__dirname, "..", "..", "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

const prisma = new PrismaClient({ adapter } as any);

export default prisma;
