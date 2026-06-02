import { HomepageSectionType } from "@prisma/client";
import { z } from "zod";
import { fail, ok, readJson, slugify, normalizeEnum } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeHomepageSection } from "@/lib/serializers";

export const runtime = "nodejs";

const sectionSchema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  type: z.string().optional(),
  subtitle: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
  enabled: z.boolean().optional(),
  settings: z.any().optional(),
});

const include = {
  sectionProducts: {
    orderBy: { displayOrder: "asc" as const },
    include: {
      product: {
        include: {
          category: true,
          subCategory: true,
          brand: true,
          images: { orderBy: { displayOrder: "asc" as const } },
          variants: true,
        },
      },
    },
  },
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const section = await getPrisma().homepageSection.findUnique({
    where: { id },
    include,
  });

  if (!section) return fail("Homepage section not found.", 404);

  return ok(serializeHomepageSection(section));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = sectionSchema.parse(await readJson(request));
    const section = await getPrisma().homepageSection.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.type ? { type: toSectionType(input.type) } : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
        ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.settings !== undefined ? { settings: input.settings } : {}),
      },
      include,
    });

    return ok(serializeHomepageSection(section));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid section data.", 422, error.issues);
    }

    console.error("Homepage section update error", error);
    return fail("Failed to update homepage section.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    await getPrisma().homepageSection.delete({ where: { id } });
    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Homepage section delete error", error);
    return fail("Failed to delete homepage section.", 500);
  }
}

function toSectionType(value: unknown) {
  const normalized = normalizeEnum(value || "CUSTOM");
  return normalized in HomepageSectionType
    ? HomepageSectionType[normalized as keyof typeof HomepageSectionType]
    : HomepageSectionType.CUSTOM;
}
