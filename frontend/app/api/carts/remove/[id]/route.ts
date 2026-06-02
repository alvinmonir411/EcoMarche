import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const item = await getPrisma().cartItem.findFirst({
      where: {
        id,
        cart: { userId: user.id },
      },
    });

    if (!item) return fail("Cart item not found.", 404);

    await getPrisma().cartItem.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    console.error("Remove cart item error", error);
    return fail("Failed to remove cart item.", 500);
  }
}
