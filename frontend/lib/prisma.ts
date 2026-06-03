import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var ecomarchePrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var ecomarchePool: Pool | undefined;
}

export function getPrisma() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/ecomarche";
  const schema = new URL(connectionString).searchParams.get("schema") ?? undefined;

  // Initialize the global Pool singleton if it doesn't exist
  if (!globalThis.ecomarchePool) {
    globalThis.ecomarchePool = new Pool({
      connectionString,
      max: 10, // Adjust pool size as needed
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  if (!globalThis.ecomarchePrisma) {
    const adapter = new PrismaPg(globalThis.ecomarchePool, { schema });

    globalThis.ecomarchePrisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalThis.ecomarchePrisma;
}

