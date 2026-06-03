import { fail, ok } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().nullable(),
  role: z.enum(["USER", "ADMIN", "VENDOR"]).optional(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const body = await request.json();
    const input = updateUserSchema.parse(body);

    const prisma = getPrisma();

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return fail("User not found.", 404);
    }

    // Check email uniqueness if email is being updated
    if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (emailExists) {
        return fail("Email is already in use.", 400);
      }
    }

    const data: any = {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };

    if (input.password) {
      data.password = await hash(input.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
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

    return ok(updatedUser);
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid user data.", 422, error.issues);
    }

    console.error("Admin update user error", error);
    return fail("Failed to update user.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    const prisma = getPrisma();

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return fail("User not found.", 404);
    }

    // Optional: Prevent deleting last admin or self
    await prisma.user.delete({ where: { id } });

    return ok({ message: "User deleted successfully", id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Admin delete user error", error);
    return fail("Failed to delete user.", 500);
  }
}
