import { fail, ok } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return ok({ canReview: false });
    }

    const { id: productId } = await context.params;
    const prisma = getPrisma();

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id
      }
    });

    if (existingReview) {
      return ok({ canReview: false, reason: "already_reviewed" });
    }

    // Ideally, check if user actually purchased the product in the orders table.
    // For now, we will just allow it if they haven't reviewed it yet.
    return ok({ canReview: true });
  } catch (error) {
    console.error("Check can-review error:", error);
    return fail("Failed to check review status.", 500);
  }
}
