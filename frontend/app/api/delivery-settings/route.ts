import { z } from "zod";
import { created, fail, ok, readJson } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeDeliverySetting } from "@/lib/serializers";

export const runtime = "nodejs";

const deliverySchema = z.object({
  name: z.string().optional(),
  insideDhaka: z.coerce.number().min(0).optional(),
  outsideDhaka: z.coerce.number().min(0).optional(),
  freeShippingOver: z.coerce.number().min(0).optional().nullable(),
  codEnabled: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    const settings = await getPrisma().deliverySetting.findMany({
      orderBy: { createdAt: "desc" },
    });

    return ok(settings.map(serializeDeliverySetting));
  } catch (error) {
    console.error("Delivery settings error", error);
    return fail("Failed to load delivery settings.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = deliverySchema.parse(await readJson(request));
    const prisma = getPrisma();

    if (input.active ?? true) {
      await prisma.deliverySetting.updateMany({
        data: { active: false },
      });
    }

    const setting = await prisma.deliverySetting.create({
      data: {
        name: input.name || "Delivery option",
        insideDhaka: input.insideDhaka ?? 70,
        outsideDhaka: input.outsideDhaka ?? 130,
        freeShippingOver: input.freeShippingOver ?? undefined,
        codEnabled: input.codEnabled ?? true,
        active: input.active ?? true,
      },
    });

    return created(serializeDeliverySetting(setting));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid delivery settings.", 422, error.issues);
    }

    console.error("Delivery setting create error", error);
    return fail("Failed to create delivery setting.", 500);
  }
}
