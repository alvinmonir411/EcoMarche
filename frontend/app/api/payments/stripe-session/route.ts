import Stripe from "stripe";
import { z } from "zod";
import { fail, ok, readJson, toNumber } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const sessionSchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return fail("Stripe is not configured yet.", 501);
    }

    const { orderId } = sessionSchema.parse(await readJson(request));
    const order = await getPrisma().order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: { items: true },
    });

    if (!order) return fail("Order not found.", 404);

    const stripe = new Stripe(stripeSecretKey);
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(toNumber(item.price) * 100),
          product_data: {
            name: item.productTitle,
            images: item.productImage ? [item.productImage] : undefined,
          },
        },
      })),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${origin}/order-success?order=${order.orderNumber}`,
      cancel_url: `${origin}/checkout?payment=cancelled`,
    });

    await getPrisma().payment.update({
      where: { orderId: order.id },
      data: {
        provider: "stripe",
        stripeSessionId: session.id,
      },
    });

    return ok({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide a valid order id.", 422, error.issues);
    }

    console.error("Stripe session error", error);
    return fail("Failed to create Stripe session.", 500);
  }
}
