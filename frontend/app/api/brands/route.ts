import { z } from "zod";
import { created, fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeBrand } from "@/lib/serializers";

export const runtime = "nodejs";

const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const brands = await getPrisma().brand.findMany({
      orderBy: { name: "asc" },
      include: { products: true },
    });

    return ok(brands.map(serializeBrand));
  } catch (error) {
    console.error("Brands list error", error);
    return fail("Failed to load brands.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = brandSchema.parse(await readJson(request));
    const brand = await getPrisma().brand.create({
      data: {
        name: input.name,
        slug: input.slug ? slugify(input.slug) : slugify(input.name),
        logoUrl: input.logoUrl ?? undefined,
        description: input.description ?? undefined,
        isActive: input.isActive ?? true,
      },
      include: { products: true },
    });

    return created(serializeBrand(brand));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid brand data.", 422, error.issues);
    }

    console.error("Brand create error", error);
    return fail("Failed to create brand.", 500);
  }
}
