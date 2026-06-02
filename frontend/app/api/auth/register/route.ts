import { z } from "zod";
import { UserRole } from "@prisma/client";
import { created, databaseUnavailable, fail, isDatabaseConnectionError, readJson } from "@/lib/api-utils";
import { createPasswordHash, signAuthToken } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await readJson(request));
    const prisma = getPrisma();

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return fail("An account already exists with this email.", 409);
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: await createPasswordHash(input.password),
        phone: input.phone,
        role: UserRole.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const accessToken = await signAuthToken(user);

    return created({
      accessToken,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide a valid name, email, and password.", 422, error.issues);
    }

    if (isDatabaseConnectionError(error)) {
      console.error("Register database error", error);
      return databaseUnavailable();
    }

    console.error("Register error", error);
    return fail("Registration failed.", 500);
  }
}
