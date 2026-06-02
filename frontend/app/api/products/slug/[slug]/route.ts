import { fail, ok } from "@/lib/api-utils";
import { getPrisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getPrisma().product.findUnique({
      where: { slug },
      include: {
        category: true,
        subCategory: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!product) {
      return fail("Product not found.", 404);
    }

    return ok(serializeProduct(product));
  } catch (error) {
    console.error("Product by slug error", error);
    return fail("Failed to load product.", 500);
  }
}
