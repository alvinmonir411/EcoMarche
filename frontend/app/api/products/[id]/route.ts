import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export const runtime = "nodejs";

const include = {
  category: true,
  subCategory: true,
  brand: true,
  images: { orderBy: { displayOrder: "asc" as const } },
  variants: { orderBy: { createdAt: "asc" as const } },
};

const updateSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  price: z.coerce.number().positive().optional(),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  flashSale: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  trending: z.boolean().optional(),
  bestSelling: z.boolean().optional(),
  justForYou: z.boolean().optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const product = await getPrisma().product.findUnique({
      where: { id },
      include,
    });

    if (!product) {
      return fail("Product not found.", 404);
    }

    return ok(serializeProduct(product));
  } catch (error) {
    console.error("Product detail error", error);
    return fail("Failed to load product.", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = updateSchema.parse(await readJson(request));
    const prisma = getPrisma();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return fail("Product not found.", 404);
    }

    const title = input.title || input.name;
    const data: Prisma.ProductUpdateInput = {
      ...(title ? { title } : {}),
      ...(input.slug ? { slug: slugify(input.slug) } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.shortDescription !== undefined ? { shortDescription: input.shortDescription } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.salePrice !== undefined || input.discountPrice !== undefined
        ? { salePrice: input.salePrice ?? input.discountPrice ?? null }
        : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.sku ? { sku: input.sku } : {}),
      ...(input.categoryId !== undefined ? { category: input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true } } : {}),
      ...(input.subCategoryId !== undefined ? { subCategory: input.subCategoryId ? { connect: { id: input.subCategoryId } } : { disconnect: true } } : {}),
      ...(input.brandId !== undefined ? { brand: input.brandId ? { connect: { id: input.brandId } } : { disconnect: true } } : {}),
      ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.flashSale !== undefined ? { flashSale: input.flashSale } : {}),
      ...(input.newArrival !== undefined ? { newArrival: input.newArrival } : {}),
      ...(input.trending !== undefined ? { trending: input.trending } : {}),
      ...(input.bestSelling !== undefined ? { bestSelling: input.bestSelling } : {}),
      ...(input.justForYou !== undefined ? { justForYou: input.justForYou } : {}),
      ...(input.active !== undefined ? { active: input.active, status: input.active ? "ACTIVE" : "INACTIVE" } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
    };

    await prisma.$transaction(async (tx) => {
      if (input.imageUrls) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: input.imageUrls.filter(Boolean).map((imageUrl, displayOrder) => ({
            productId: id,
            imageUrl,
            displayOrder,
            altText: title || existing.title,
          })),
        });
      }

      if (input.sizes || input.colors) {
        const sizes = input.sizes?.filter(Boolean) ?? ["Default"];
        const colors = input.colors?.filter(Boolean) ?? ["Default"];
        const price = input.salePrice ?? input.discountPrice ?? input.price ?? Number(existing.salePrice ?? existing.price);
        const stock = input.stock ?? existing.stock;
        const sku = input.sku ?? existing.sku;

        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({
          data: sizes.flatMap((size) =>
            colors.map((color) => ({
              productId: id,
              size,
              color,
              price,
              stock: Math.max(0, Math.floor(stock / Math.max(1, sizes.length * colors.length))),
              sku: `${sku}-${slugify(size)}-${slugify(color)}`.toUpperCase(),
            })),
          ),
        });
      }

      await tx.product.update({
        where: { id },
        data,
      });
    });

    const product = await prisma.product.findUniqueOrThrow({ where: { id }, include });

    return ok(serializeProduct(product));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid product data.", 422, error.issues);
    }

    console.error("Product update error", error);
    return fail("Failed to update product.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    await getPrisma().product.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Product delete error", error);
    return fail("Failed to delete product.", 500);
  }
}
