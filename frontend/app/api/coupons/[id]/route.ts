import { CouponType } from "@prisma/client";
import { z } from "zod";
import { fail, ok, readJson, normalizeEnum } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/serializers";

export const runtime = "nodejs";

const couponSchema = z.object({
  code: z.string().min(2).optional(),
  type: z.string().optional(),
  discountValue: z.coerce.number().positive().optional(),
  minOrderValue: z.coerce.number().min(0).optional().nullable(),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  maxUsage: z.coerce.number().int().min(1).optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const coupon = await getPrisma().coupon.findUnique({ where: { id } });
    if (!coupon) return fail("Coupon not found.", 404);
    return ok(serializeCoupon(coupon));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Coupon detail error", error);
    return fail("Failed to load coupon.", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = couponSchema.parse(await readJson(request));
    const coupon = await getPrisma().coupon.update({
      where: { id },
      data: {
        ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
        ...(input.type ? { type: toCouponType(input.type) } : {}),
        ...(input.discountValue !== undefined ? { discountValue: input.discountValue } : {}),
        ...(input.minOrderValue !== undefined ? { minOrderValue: input.minOrderValue } : {}),
        ...(input.maxDiscount !== undefined ? { maxDiscount: input.maxDiscount } : {}),
        ...(input.maxUsage !== undefined ? { maxUsage: input.maxUsage } : {}),
        ...(input.expiryDate !== undefined ? { expiryDate: input.expiryDate ? new Date(input.expiryDate) : null } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });

    return ok(serializeCoupon(coupon));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid coupon data.", 422, error.issues);
    }

    console.error("Coupon update error", error);
    return fail("Failed to update coupon.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    await getPrisma().coupon.delete({ where: { id } });
    return ok({ id });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Coupon delete error", error);
    return fail("Failed to delete coupon.", 500);
  }
}

function toCouponType(value: unknown) {
  const normalized = normalizeEnum(value || "PERCENTAGE");
  return normalized in CouponType ? CouponType[normalized as keyof typeof CouponType] : CouponType.PERCENTAGE;
}
