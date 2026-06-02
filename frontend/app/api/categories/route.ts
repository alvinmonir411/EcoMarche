import { z } from "zod";
import { created, fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";

export const runtime = "nodejs";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const categories = await getPrisma().category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        products: true,
        subCategories: true,
      },
    });

    return ok(categories.map(serializeCategory));
  } catch (error) {
    console.error("Categories list error", error);
    return fail("Failed to load categories.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = categorySchema.parse(await readJson(request));
    const slug = input.slug ? slugify(input.slug) : slugify(input.name);

    const category = await getPrisma().category.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? undefined,
        imageUrl: input.imageUrl ?? undefined,
        seoTitle: input.seoTitle ?? `${input.name} | EcoMarche`,
        seoDescription: input.seoDescription ?? input.description ?? undefined,
        isActive: input.isActive ?? true,
      },
      include: {
        products: true,
        subCategories: true,
      },
    });

    return created(serializeCategory(category));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid category data.", 422, error.issues);
    }

    console.error("Category create error", error);
    return fail("Failed to create category.", 500);
  }
}
