import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const reorderSchema = z.object({
  sectionIds: z.array(z.string()).min(1),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const { sectionIds } = reorderSchema.parse(await readJson(request));
    const prisma = getPrisma();

    await prisma.$transaction(
      sectionIds.map((id, index) =>
        prisma.homepageSection.update({
          where: { id },
          data: { displayOrder: index + 1 },
        }),
      ),
    );

    return ok({ reordered: true });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide section ids.", 422, error.issues);
    }

    console.error("Homepage section reorder error", error);
    return fail("Failed to reorder homepage sections.", 500);
  }
}
