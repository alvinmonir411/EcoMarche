import { z } from "zod";
import { created, fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeSubCategory } from "@/lib/serializers";

export const runtime = "nodejs";

const subCategorySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const subCategories = await getPrisma().subCategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: true, products: true },
    });

    return ok(subCategories.map(serializeSubCategory));
  } catch (error) {
    console.error("Subcategories list error", error);
    return fail("Failed to load subcategories.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = subCategorySchema.parse(await readJson(request));
    const subCategory = await getPrisma().subCategory.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug ? slugify(input.slug) : slugify(input.name),
        description: input.description ?? undefined,
        imageUrl: input.imageUrl ?? undefined,
        isActive: input.isActive ?? true,
      },
      include: { category: true, products: true },
    });

    return created(serializeSubCategory(subCategory));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid subcategory data.", 422, error.issues);
    }

    console.error("Subcategory create error", error);
    return fail("Failed to create subcategory.", 500);
  }
}
