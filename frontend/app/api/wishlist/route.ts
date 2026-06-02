import { z } from "zod";
import { created, fail, ok, readJson } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeWishlistItem } from "@/lib/serializers";

export const runtime = "nodejs";

const wishlistSchema = z.object({
  productId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const wishlist = await getPrisma().wishlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
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

    return ok({
      items: wishlist.map(serializeWishlistItem),
    });
  } catch (error) {
    console.error("Wishlist load error", error);
    return fail("Failed to load wishlist.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const input = wishlistSchema.parse(await readJson(request));
    const item = await getPrisma().wishlist.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: input.productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId: input.productId,
      },
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

    return created(serializeWishlistItem(item));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide a product id.", 422, error.issues);
    }

    console.error("Wishlist create error", error);
    return fail("Failed to add wishlist item.", 500);
  }
}
