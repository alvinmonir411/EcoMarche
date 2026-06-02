import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeHomepageSection } from "@/lib/serializers";

export const runtime = "nodejs";

const assignSchema = z.object({
  productIds: z.array(z.string()).default([]),
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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const { productIds } = assignSchema.parse(await readJson(request));
    const prisma = getPrisma();

    await prisma.$transaction(async (tx) => {
      await tx.homepageSectionProduct.deleteMany({ where: { sectionId: id } });
      if (productIds.length > 0) {
        await tx.homepageSectionProduct.createMany({
          data: productIds.map((productId, displayOrder) => ({
            sectionId: id,
            productId,
            displayOrder: displayOrder + 1,
          })),
          skipDuplicates: true,
        });
      }
    });

    const section = await prisma.homepageSection.findUniqueOrThrow({
      where: { id },
      include,
    });

    return ok(serializeHomepageSection(section));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide product ids.", 422, error.issues);
    }

    console.error("Homepage products assign error", error);
    return fail("Failed to assign section products.", 500);
  }
}
