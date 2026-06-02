import { z } from "zod";
import { fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";

export const runtime = "nodejs";

const categorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const category = await getPrisma().category.findUnique({
    where: { id },
    include: {
      products: true,
      subCategories: true,
    },
  });

  if (!category) return fail("Category not found.", 404);

  return ok(serializeCategory(category));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = categorySchema.parse(await readJson(request));
    const category = await getPrisma().category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
        ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: {
        products: true,
        subCategories: true,
      },
    });

    return ok(serializeCategory(category));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid category data.", 422, error.issues);
    }

    console.error("Category update error", error);
    return fail("Failed to update category.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    await getPrisma().category.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Category delete error", error);
    return fail("Failed to delete category.", 500);
  }
}
