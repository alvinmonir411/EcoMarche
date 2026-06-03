import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok, readJson, normalizeEnum, toNumber } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeOrder, serializeProduct } from "@/lib/serializers";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(5).optional(),
  shippingAddress: z.string().min(5).optional(),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  addressLine: z.string().optional(),
  orderNote: z.string().optional().nullable(),
  deliveryCharge: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  couponCode: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const input = checkoutSchema.parse(await readJson(request));
    const prisma = getPrisma();
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                subCategory: true,
                brand: true,
                images: { orderBy: { displayOrder: "asc" } },
                variants: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return fail("Your cart is empty.", 400);
    }

    for (const item of cart.items) {
      if (!item.product.active || item.product.stock < item.quantity) {
        return fail(`${item.product.title} is out of stock or unavailable.`, 400);
      }
    }

    const subtotal = cart.items.reduce((total: number, item: any) => {
      const product = serializeProduct(item.product);
      return total + (product.discountPrice ?? product.price) * item.quantity;
    }, 0);

    let discount = 0;
    let couponCode = input.couponCode?.trim().toUpperCase() || null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      const now = new Date();

      if (
        coupon?.active &&
        (!coupon.expiryDate || coupon.expiryDate > now) &&
        (!coupon.startsAt || coupon.startsAt <= now) &&
        (!coupon.maxUsage || coupon.usedCount < coupon.maxUsage) &&
        (!coupon.minOrderValue || subtotal >= toNumber(coupon.minOrderValue))
      ) {
        discount =
          coupon.type === "PERCENTAGE"
            ? (subtotal * toNumber(coupon.discountValue)) / 100
            : toNumber(coupon.discountValue);

        if (coupon.maxDiscount) {
          discount = Math.min(discount, toNumber(coupon.maxDiscount));
        }
      } else {
        couponCode = null;
      }
    }

    const deliverySetting = await prisma.deliverySetting.findFirst({ where: { active: true } });
    const deliveryCharge =
      input.deliveryCharge ??
      (deliverySetting?.freeShippingOver && subtotal >= toNumber(deliverySetting.freeShippingOver)
        ? 0
        : toNumber(deliverySetting?.insideDhaka, 70));
    const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);
    const paymentMethod = toPaymentMethod(input.paymentMethod);
    const paymentStatus = paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? PaymentStatus.PENDING : PaymentStatus.PENDING;

    const customerName = input.customerName || input.fullName || user.name;
    const customerEmail = input.customerEmail || input.email || user.email;
    const customerPhone = input.customerPhone || input.phone || "";
    const shippingAddress =
      input.shippingAddress ||
      [input.addressLine, input.upazila, input.district, input.division].filter(Boolean).join(", ");

    if (!customerPhone || !shippingAddress) {
      return fail("Phone number and delivery address are required.", 422);
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: `ECO-${Date.now()}`,
          userId: user.id,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          orderNote: input.orderNote || undefined,
          subtotal,
          deliveryCharge,
          discount,
          totalAmount,
          couponCode,
          paymentMethod,
          paymentStatus,
          items: {
            create: cart.items.map((item) => {
              const product = serializeProduct(item.product);
              const price = product.discountPrice ?? product.price;

              return {
                productId: item.productId,
                variantId: item.variantId,
                productTitle: item.product.title,
                productSlug: item.product.slug,
                productImage: product.imageUrl,
                sku: item.variant?.sku || item.product.sku,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
                quantity: item.quantity,
                price,
                total: price * item.quantity,
              };
            }),
          },
          payment: {
            create: {
              method: paymentMethod,
              status: paymentStatus,
              amount: totalAmount,
              currency: "USD",
              provider: paymentMethod === PaymentMethod.STRIPE ? "stripe" : "cod",
            },
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }

      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    const fullOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
      },
    });

    return ok(serializeOrder(fullOrder));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide valid checkout information.", 422, error.issues);
    }

    console.error("Checkout error", error);
    return fail("Failed to place order.", 500);
  }
}

function toPaymentMethod(value: unknown) {
  const normalized = normalizeEnum(value || "cash_on_delivery");
  if (normalized === "COD") return PaymentMethod.CASH_ON_DELIVERY;
  if (normalized in PaymentMethod) return PaymentMethod[normalized as keyof typeof PaymentMethod];
  return PaymentMethod.CASH_ON_DELIVERY;
}
