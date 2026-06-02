import { BannerType } from "@prisma/client";
import { z } from "zod";
import { created, fail, ok, readJson, normalizeEnum } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeBanner } from "@/lib/serializers";

export const runtime = "nodejs";

const bannerSchema = z.object({
  type: z.string().optional(),
  title: z.string().min(2),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  link: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
  enabled: z.boolean().optional(),
});

export async function GET() {
  try {
    const banners = await getPrisma().banner.findMany({
      orderBy: [{ type: "asc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
    });

    return ok(banners.map(serializeBanner));
  } catch (error) {
    console.error("Homepage banners error", error);
    return fail("Failed to load banners.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = bannerSchema.parse(await readJson(request));
    const banner = await getPrisma().banner.create({
      data: {
        type: toBannerType(input.type),
        title: input.title,
        subtitle: input.subtitle ?? undefined,
        imageUrl: input.imageUrl,
        link: input.link ?? undefined,
        displayOrder: input.displayOrder ?? 0,
        enabled: input.enabled ?? true,
      },
    });

    return created(serializeBanner(banner));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid banner data.", 422, error.issues);
    }

    console.error("Banner create error", error);
    return fail("Failed to create banner.", 500);
  }
}

function toBannerType(value: unknown) {
  const normalized = normalizeEnum(value || "HERO_SLIDE");
  return normalized in BannerType ? BannerType[normalized as keyof typeof BannerType] : BannerType.HERO_SLIDE;
}
