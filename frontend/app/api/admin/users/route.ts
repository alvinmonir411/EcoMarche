import { fail, ok } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const users = await getPrisma().user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            wishlists: true,
          },
        },
      },
    });

    return ok(
      users.map((user) => ({
        ...user,
        ordersCount: user._count.orders,
        wishlistCount: user._count.wishlists,
      })),
    );
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    console.error("Admin users error", error);
    return fail("Failed to load users.", 500);
  }
}
