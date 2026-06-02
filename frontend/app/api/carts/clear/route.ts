import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    await getPrisma().cartItem.deleteMany({
      where: {
        cart: { userId: user.id },
      },
    });

    return ok({ cleared: true });
  } catch (error) {
    console.error("Clear cart error", error);
    return fail("Failed to clear cart.", 500);
  }
}
