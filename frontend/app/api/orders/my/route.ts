import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const orders = await getPrisma().order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
      },
    });

    return ok(orders.map(serializeOrder));
  } catch (error) {
    console.error("My orders error", error);
    return fail("Failed to load your orders.", 500);
  }
}
