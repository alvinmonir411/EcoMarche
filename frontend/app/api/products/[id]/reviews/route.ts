import { fail, ok } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Get all reviews for a product
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prisma = getPrisma();

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    return ok({ reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return fail("Failed to fetch reviews.", 500);
  }
}

// Create a new review for a product
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    const { id: productId } = await context.params;
    
    const body = await request.json();
    const input = reviewSchema.parse(body);
    const prisma = getPrisma();

    // Verify if user already reviewed
    const existing = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id
      }
    });

    if (existing) {
      return fail("You have already reviewed this product.", 400);
    }

    const review = await prisma.review.create({
      data: {
        rating: input.rating,
        comment: input.comment,
        productId,
        userId: user.id
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    });

    // Optionally update product's average rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });
    
    const avgRating = allReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / allReviews.length;
    
    await prisma.product.update({
      where: { id: productId },
      data: { 
        rating: avgRating,
        reviewCount: allReviews.length 
      }
    });

    return ok({ review, message: "Review submitted successfully" }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return fail("Invalid data", 422, error.issues);
    
    console.error("Create review error:", error);
    return fail("Failed to submit review.", 500);
  }
}
