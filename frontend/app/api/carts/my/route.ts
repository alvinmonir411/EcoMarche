import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCartItem } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const cart = await getPrisma().cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                subCategory: true,
                brand: true,
                images: { orderBy: { displayOrder: "asc" } },
                variants: true,
              },
            },
          },
        },
      },
    });

    const items = cart.items.map(serializeCartItem);

    return ok({
      id: cart.id,
      items,
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    });
  } catch (error) {
    console.error("Cart load error", error);
    return fail("Failed to load cart.", 500);
  }
}
