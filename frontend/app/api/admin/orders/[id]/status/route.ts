import { OrderStatus, PaymentStatus, DeliveryStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok, normalizeEnum, readJson } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export const runtime = "nodejs";

const statusSchema = z.object({
  status: z.string().optional(),
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  deliveryStatus: z.string().optional(),
  trackingNumber: z.string().optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = statusSchema.parse(await readJson(request));

    const order = await getPrisma().order.update({
      where: { id },
      data: {
        ...(input.status || input.orderStatus
          ? { orderStatus: toOrderStatus(input.status || input.orderStatus) }
          : {}),
        ...(input.paymentStatus ? { paymentStatus: toPaymentStatus(input.paymentStatus) } : {}),
        ...(input.deliveryStatus ? { deliveryStatus: toDeliveryStatus(input.deliveryStatus) } : {}),
        ...(input.trackingNumber !== undefined ? { trackingNumber: input.trackingNumber } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
      },
    });

    if (input.paymentStatus && order.payment) {
      await getPrisma().payment.update({
        where: { orderId: order.id },
        data: { status: toPaymentStatus(input.paymentStatus) },
      });
    }

    return ok(serializeOrder(order));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid status data.", 422, error.issues);
    }

    console.error("Admin status update error", error);
    return fail("Failed to update order status.", 500);
  }
}

function toOrderStatus(value: unknown) {
  const normalized = normalizeEnum(value || "pending");
  return normalized in OrderStatus ? OrderStatus[normalized as keyof typeof OrderStatus] : OrderStatus.PENDING;
}

function toPaymentStatus(value: unknown) {
  const normalized = normalizeEnum(value || "pending");
  return normalized in PaymentStatus ? PaymentStatus[normalized as keyof typeof PaymentStatus] : PaymentStatus.PENDING;
}

function toDeliveryStatus(value: unknown) {
  const normalized = normalizeEnum(value || "pending");
  return normalized in DeliveryStatus ? DeliveryStatus[normalized as keyof typeof DeliveryStatus] : DeliveryStatus.PENDING;
}
