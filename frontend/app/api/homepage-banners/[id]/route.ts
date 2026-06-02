import { BannerType } from "@prisma/client";
import { z } from "zod";
import { fail, ok, readJson, normalizeEnum } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeBanner } from "@/lib/serializers";

export const runtime = "nodejs";

const bannerSchema = z.object({
  type: z.string().optional(),
  title: z.string().min(2).optional(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional(),
  link: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
  enabled: z.boolean().optional(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const banner = await getPrisma().banner.findUnique({ where: { id } });
  if (!banner) return fail("Banner not found.", 404);
  return ok(serializeBanner(banner));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = bannerSchema.parse(await readJson(request));
    const banner = await getPrisma().banner.update({
      where: { id },
      data: {
        ...(input.type ? { type: toBannerType(input.type) } : {}),
        ...(input.title ? { title: input.title } : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
        ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
        ...(input.link !== undefined ? { link: input.link } : {}),
        ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      },
    });

    return ok(serializeBanner(banner));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid banner data.", 422, error.issues);
    }

    console.error("Banner update error", error);
    return fail("Failed to update banner.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    await getPrisma().banner.delete({ where: { id } });
    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Banner delete error", error);
    return fail("Failed to delete banner.", 500);
  }
}

function toBannerType(value: unknown) {
  const normalized = normalizeEnum(value || "HERO_SLIDE");
  return normalized in BannerType ? BannerType[normalized as keyof typeof BannerType] : BannerType.HERO_SLIDE;
}
