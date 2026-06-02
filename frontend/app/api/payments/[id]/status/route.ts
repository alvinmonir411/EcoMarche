import { PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { fail, ok, normalizeEnum, readJson, toNumber } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const statusSchema = z.object({
  status: z.string().min(2),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = statusSchema.parse(await readJson(request));
    const status = toPaymentStatus(input.status);

    const payment = await getPrisma().payment.update({
      where: { id },
      data: { status },
      include: { order: true },
    });

    await getPrisma().order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: status },
    });

    return ok({
      ...payment,
      amount: toNumber(payment.amount),
      paymentMethod: payment.method,
    });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid payment status.", 422, error.issues);
    }

    console.error("Payment status update error", error);
    return fail("Failed to update payment status.", 500);
  }
}

function toPaymentStatus(value: unknown) {
  const normalized = normalizeEnum(value || "pending");
  return normalized in PaymentStatus ? PaymentStatus[normalized as keyof typeof PaymentStatus] : PaymentStatus.PENDING;
}
