import { CouponType } from "@prisma/client";
import { z } from "zod";
import { created, fail, ok, readJson, normalizeEnum } from "@/lib/api-utils";
import { getAuthUserFromRequest, requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeCoupon } from "@/lib/serializers";

export const runtime = "nodejs";

const couponSchema = z.object({
  code: z.string().min(2),
  type: z.string().optional(),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).optional().nullable(),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  maxUsage: z.coerce.number().int().min(1).optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    const coupons = await getPrisma().coupon.findMany({
      where: user?.role === "ADMIN" ? undefined : { active: true },
      orderBy: { createdAt: "desc" },
    });

    return ok(coupons.map(serializeCoupon));
  } catch (error) {
    console.error("Coupons list error", error);
    return fail("Failed to load coupons.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = couponSchema.parse(await readJson(request));
    const coupon = await getPrisma().coupon.create({
      data: {
        code: input.code.trim().toUpperCase(),
        type: toCouponType(input.type),
        discountValue: input.discountValue,
        minOrderValue: input.minOrderValue ?? undefined,
        maxDiscount: input.maxDiscount ?? undefined,
        maxUsage: input.maxUsage ?? undefined,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        active: input.active ?? true,
      },
    });

    return created(serializeCoupon(coupon));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid coupon data.", 422, error.issues);
    }

    console.error("Coupon create error", error);
    return fail("Failed to create coupon.", 500);
  }
}

function toCouponType(value: unknown) {
  const normalized = normalizeEnum(value || "PERCENTAGE");
  return normalized in CouponType ? CouponType[normalized as keyof typeof CouponType] : CouponType.PERCENTAGE;
}
