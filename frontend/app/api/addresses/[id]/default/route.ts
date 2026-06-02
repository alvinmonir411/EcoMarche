import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const prisma = getPrisma();
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) return fail("Address not found.", 404);

    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return ok(address);
  } catch (error) {
    console.error("Default address error", error);
    return fail("Failed to set default address.", 500);
  }
}
