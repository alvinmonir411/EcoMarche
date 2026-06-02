import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCartItem } from "@/lib/serializers";

export const runtime = "nodejs";

const addCartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  selectedSize: z.string().optional().nullable(),
  selectedColor: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const input = addCartItemSchema.parse(await readJson(request));
    const selectedSize = input.selectedSize || input.size || null;
    const selectedColor = input.selectedColor || input.color || null;
    const prisma = getPrisma();

    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product?.active) return fail("Product is not available.", 404);
    if (product.stock < input.quantity) return fail("Requested quantity exceeds stock.", 400);

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: input.productId,
        selectedSize,
        selectedColor,
      },
    });

    const cartItem = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + input.quantity },
          include: cartItemInclude,
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            variantId: input.variantId || undefined,
            quantity: input.quantity,
            selectedSize,
            selectedColor,
          },
          include: cartItemInclude,
        });

    return ok(serializeCartItem(cartItem));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide a valid cart item.", 422, error.issues);
    }

    console.error("Add cart item error", error);
    return fail("Failed to add item to cart.", 500);
  }
}

const cartItemInclude = {
  product: {
    include: {
      category: true,
      subCategory: true,
      brand: true,
      images: { orderBy: { displayOrder: "asc" as const } },
      variants: true,
    },
  },
};
