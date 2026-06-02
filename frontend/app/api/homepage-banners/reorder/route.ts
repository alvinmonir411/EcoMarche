import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const reorderSchema = z.object({
  bannerIds: z.array(z.string()).min(1),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const { bannerIds } = reorderSchema.parse(await readJson(request));

    await getPrisma().$transaction(
      bannerIds.map((id, index) =>
        getPrisma().banner.update({
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
      return fail("Please provide banner ids.", 422, error.issues);
    }

    console.error("Banner reorder error", error);
    return fail("Failed to reorder banners.", 500);
  }
}
