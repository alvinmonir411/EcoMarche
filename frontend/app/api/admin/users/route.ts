import { fail, ok } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN", "VENDOR"]).default("USER"),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const users = await getPrisma().user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            wishlists: true,
          },
        },
      },
    });

    return ok(
      users.map((user) => ({
        ...user,
        ordersCount: user._count.orders,
        wishlistCount: user._count.wishlists,
      })),
    );
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Admin users error", error);
    return fail("Failed to load users.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const input = createUserSchema.parse(body);

    const prisma = getPrisma();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      return fail("Email is already registered.", 400);
    }

    const hashedPassword = await hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashedPassword,
        role: input.role,
        phone: input.phone || null,
        isActive: input.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return ok({
      ...user,
      ordersCount: 0,
      wishlistCount: 0,
    });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid user data.", 422, error.issues);
    }

    console.error("Admin create user error", error);
    return fail("Failed to create user.", 500);
  }
}

