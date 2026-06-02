import { fail, ok, toNumber } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const payments = await getPrisma().payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return ok(
      payments.map((payment) => ({
        ...payment,
        amount: toNumber(payment.amount),
        paymentMethod: payment.method,
        customerName: payment.order.customerName,
        user: payment.order.user,
      })),
    );
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Payments list error", error);
    return fail("Failed to load payments.", 500);
  }
}
