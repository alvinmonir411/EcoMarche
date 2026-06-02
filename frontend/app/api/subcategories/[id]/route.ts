import { z } from "zod";
import { fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeSubCategory } from "@/lib/serializers";

export const runtime = "nodejs";

const subCategorySchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const subCategory = await getPrisma().subCategory.findUnique({
    where: { id },
    include: { category: true, products: true },
  });

  if (!subCategory) return fail("Subcategory not found.", 404);

  return ok(serializeSubCategory(subCategory));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = subCategorySchema.parse(await readJson(request));
    const subCategory = await getPrisma().subCategory.update({
      where: { id },
      data: {
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: { category: true, products: true },
    });

    return ok(serializeSubCategory(subCategory));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid subcategory data.", 422, error.issues);
    }

    console.error("Subcategory update error", error);
    return fail("Failed to update subcategory.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    await getPrisma().subCategory.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Subcategory delete error", error);
    return fail("Failed to delete subcategory.", 500);
  }
}
