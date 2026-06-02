import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeWebsiteSetting } from "@/lib/serializers";

export const runtime = "nodejs";

const settingSchema = z.object({
  key: z.string().default("site"),
  value: z.any().optional(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  themeColor: z.string().optional().nullable(),
  footer: z.any().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const setting = await getPrisma().websiteSetting.findUnique({
      where: { key: "site" },
    });

    return ok(setting ? serializeWebsiteSetting(setting) : null);
  } catch (error) {
    console.error("Settings load error", error);
    return fail("Failed to load settings.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const input = settingSchema.parse(await readJson(request));
    const setting = await getPrisma().websiteSetting.upsert({
      where: { key: input.key },
      update: {
        ...(input.value !== undefined ? { value: input.value } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.faviconUrl !== undefined ? { faviconUrl: input.faviconUrl } : {}),
        ...(input.themeColor !== undefined ? { themeColor: input.themeColor } : {}),
        ...(input.footer !== undefined ? { footer: input.footer } : {}),
        ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
        ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      },
      create: {
        key: input.key,
        value: input.value ?? {},
        logoUrl: input.logoUrl ?? undefined,
        faviconUrl: input.faviconUrl ?? undefined,
        themeColor: input.themeColor ?? undefined,
        footer: input.footer ?? undefined,
        seoTitle: input.seoTitle ?? undefined,
        seoDescription: input.seoDescription ?? undefined,
      },
    });

    return ok(serializeWebsiteSetting(setting));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid settings.", 422, error.issues);
    }

    console.error("Settings update error", error);
    return fail("Failed to update settings.", 500);
  }
}
