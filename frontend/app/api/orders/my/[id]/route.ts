import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const order = await getPrisma().order.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        payment: true,
      },
    });

    if (!order) return fail("Order not found.", 404);

    return ok(serializeOrder(order));
  } catch (error) {
    console.error("My order detail error", error);
    return fail("Failed to load order.", 500);
  }
}
