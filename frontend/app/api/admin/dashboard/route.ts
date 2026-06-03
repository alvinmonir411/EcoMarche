import { fail, ok, toNumber } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const prisma = getPrisma();

    const [totalOrders, totalUsers, totalProducts, paidOrders, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true } }),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
    ]);

    const totalSales = paidOrders.reduce((sum: number, order: any) => sum + toNumber(order.totalAmount), 0);

    return ok({
      stats: {
        totalSales,
        totalRevenue: totalSales,
        totalOrders,
        totalUsers,
        totalCustomers: totalUsers,
        totalProducts,
        pendingOrders,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Admin dashboard error", error);
    return fail("Failed to load dashboard stats.", 500);
  }
}
