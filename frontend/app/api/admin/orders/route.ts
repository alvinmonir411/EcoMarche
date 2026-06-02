import { fail, ok } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const orders = await getPrisma().order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
      },
    });

    return ok(orders.map(serializeOrder));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Admin orders error", error);
    return fail("Failed to load admin orders.", 500);
  }
}
