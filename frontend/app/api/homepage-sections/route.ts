import { HomepageSectionType } from "@prisma/client";
import { z } from "zod";
import { created, fail, ok, readJson, slugify, normalizeEnum } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeHomepageSection } from "@/lib/serializers";

export const runtime = "nodejs";

const sectionSchema = z.object({
  title: z.string().min(2),
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get("admin") === "true";

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

    const sections = await getPrisma().homepageSection.findMany({
      where: includeDisabled ? undefined : { enabled: true },
      orderBy: { displayOrder: "asc" },
      include,
    });

    // Filter out inactive products at application level (Prisma doesn't support
    // `where` on a to-one relation nested inside an include)
    const filteredSections = includeDisabled
      ? sections
      : sections.map((section) => ({
          ...section,
          sectionProducts: section.sectionProducts.filter(
            (sp) => sp.product?.active !== false,
          ),
        }));

    return ok(filteredSections.map(serializeHomepageSection));
  } catch (error) {
    console.error("Homepage sections error", error);
    return fail("Failed to load homepage sections.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = sectionSchema.parse(await readJson(request));
    const section = await getPrisma().homepageSection.create({
      data: {
        title: input.title,
        slug: input.slug ? slugify(input.slug) : slugify(input.title),
        type: toSectionType(input.type),
        subtitle: input.subtitle ?? undefined,
        displayOrder: input.displayOrder ?? 0,
        enabled: input.enabled ?? true,
        settings: input.settings,
      },
      include,
    });

    return created(serializeHomepageSection(section));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid section data.", 422, error.issues);
    }

    console.error("Homepage section create error", error);
    return fail("Failed to create homepage section.", 500);
  }
}

function toSectionType(value: unknown) {
  const normalized = normalizeEnum(value || "CUSTOM");
  return normalized in HomepageSectionType
    ? HomepageSectionType[normalized as keyof typeof HomepageSectionType]
    : HomepageSectionType.CUSTOM;
}
