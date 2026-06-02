import { z } from "zod";
import { fail, ok, readJson, toNumber } from "@/lib/api-utils";
import { getPrisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/serializers";

export const runtime = "nodejs";

const applySchema = z.object({
  code: z.string().min(2),
  subtotal: z.coerce.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const input = applySchema.parse(await readJson(request));
    const coupon = await getPrisma().coupon.findUnique({
      where: { code: input.code.trim().toUpperCase() },
    });

    const now = new Date();
    if (
      !coupon?.active ||
      (coupon.expiryDate && coupon.expiryDate <= now) ||
      (coupon.startsAt && coupon.startsAt > now) ||
      (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage)
    ) {
      return fail("Coupon is invalid or expired.", 404);
    }

    if (input.subtotal && coupon.minOrderValue && input.subtotal < toNumber(coupon.minOrderValue)) {
      return fail(`Minimum order value is ${toNumber(coupon.minOrderValue).toFixed(2)}.`, 400);
    }

    return ok(serializeCoupon(coupon));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide a valid coupon code.", 422, error.issues);
    }

    console.error("Coupon apply error", error);
    return fail("Failed to apply coupon.", 500);
  }
}
