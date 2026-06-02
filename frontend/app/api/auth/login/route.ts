import { z } from "zod";
import { databaseUnavailable, fail, isDatabaseConnectionError, ok, readJson } from "@/lib/api-utils";
import { signAuthToken, verifyPassword } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await readJson(request));
    const user = await getPrisma().user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user?.isActive) {
      return fail("Invalid login credentials.", 401);
    }

    const valid = await verifyPassword(input.password, user.password);
    if (!valid) {
      return fail("Invalid login credentials.", 401);
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return ok({
      accessToken: await signAuthToken(authUser),
      user: authUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Email and password are required.", 422, error.issues);
    }

    if (isDatabaseConnectionError(error)) {
      console.error("Login database error", error);
      return databaseUnavailable();
    }

    console.error("Login error", error);
    return fail("Login failed.", 500);
  }
}
