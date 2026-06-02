import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { productId } = await context.params;

    await getPrisma().wishlist.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return ok({ productId });
  } catch (error) {
    console.error("Wishlist delete error", error);
    return fail("Failed to remove wishlist item.", 500);
  }
}
