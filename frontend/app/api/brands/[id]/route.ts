import { z } from "zod";
import { fail, ok, readJson, slugify } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeBrand } from "@/lib/serializers";

export const runtime = "nodejs";

const brandSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const brand = await getPrisma().brand.findUnique({
    where: { id },
    include: { products: true },
  });

  if (!brand) return fail("Brand not found.", 404);

  return ok(serializeBrand(brand));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = brandSchema.parse(await readJson(request));
    const brand = await getPrisma().brand.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: { products: true },
    });

    return ok(serializeBrand(brand));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid brand data.", 422, error.issues);
    }

    console.error("Brand update error", error);
    return fail("Failed to update brand.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;

    await getPrisma().brand.delete({ where: { id } });

    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Brand delete error", error);
    return fail("Failed to delete brand.", 500);
  }
}
