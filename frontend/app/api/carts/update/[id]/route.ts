import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCartItem } from "@/lib/serializers";

export const runtime = "nodejs";

const updateSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const input = updateSchema.parse(await readJson(request));
    const prisma = getPrisma();

    const existing = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: { userId: user.id },
      },
      include: { product: true },
    });

    if (!existing) return fail("Cart item not found.", 404);
    if (existing.product.stock < input.quantity) return fail("Requested quantity exceeds stock.", 400);

    const item = await prisma.cartItem.update({
      where: { id },
      data: { quantity: input.quantity },
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
    });

    return ok(serializeCartItem(item));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide a valid quantity.", 422, error.issues);
    }

    console.error("Update cart item error", error);
    return fail("Failed to update cart item.", 500);
  }
}
