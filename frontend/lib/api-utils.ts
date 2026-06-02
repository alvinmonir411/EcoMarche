import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status },
  );
}

export function isDatabaseConnectionError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  const message = error instanceof Error ? error.message : String(error);

  return (
    code === "ECONNREFUSED" ||
    code === "P1001" ||
    message.includes("ECONNREFUSED") ||
    message.includes("Can't reach database server") ||
    message.includes("connect ECONNREFUSED")
  );
}

export function databaseUnavailable() {
  const message =
    process.env.NODE_ENV === "development"
      ? "Database is not reachable. Start PostgreSQL, then run npm run db:push and npm run db:seed."
      : "Database is temporarily unavailable. Please try again shortly.";

  return fail(message, 503);
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function normalizeEnum(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/-/g, "_")
    .toUpperCase();
}
