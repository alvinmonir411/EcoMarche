import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var ecomarchePrisma: PrismaClient | undefined;
}

export function getPrisma() {
  if (!globalThis.ecomarchePrisma) {
    const connectionString =
      process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/ecomarche";
    const schema = new URL(connectionString).searchParams.get("schema") ?? undefined;
    const adapter = new PrismaPg({ connectionString }, { schema });

    globalThis.ecomarchePrisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalThis.ecomarchePrisma;
}
