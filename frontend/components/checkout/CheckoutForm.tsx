"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { cartApi, orderApi } from "@/services/api";
import { getToken } from "@/lib/auth";
import { getImageUrl } from "@/utils/image";

export function CheckoutForm() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      if (!getToken()) {
        router.push("/login");
        return;
      }
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.success) {
        setCartItems(res.data?.items || res.data || []);
      } else {
        setError((Array.isArray(res.error) ? res.error.join(", ") : res.error) || "Failed to load cart data.");
      }
      setLoading(false);
    };
    loadCart();
  }, [router]);

  const subtotal = cartItems.reduce((total, item) => {
    const product = item.product || item;
    const price = product.discountPrice ?? product.price;
    return total + price * item.quantity;
  }, 0);
  
  const deliveryCharge = cartItems.length > 0 ? 8 : 0;
  const discount = 0; // Simple fallback, logic could be added later
  const total = subtotal + deliveryCharge - discount;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      setSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const orderData = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      division: formData.get("division"),
      district: formData.get("district"),
      upazila: formData.get("upazila"),
      postalCode: formData.get("postalCode"),
      addressLine: formData.get("addressLine"),
      orderNote: formData.get("orderNote"),
      paymentMethod: formData.get("paymentMethod"),
      items: cartItems.map((item) => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity,
        price: item.product?.discountPrice ?? item.product?.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })),
      subtotal,
      deliveryCharge,
      discount,
      total,
    };

    const res = await orderApi.create(orderData);
    
    if (res.success) {
      // Clear cart locally (or rely on backend clearing it upon order success)
      await cartApi.clearCart(); 
      router.push("/order-success");
    } else {
      setError((Array.isArray(res.error) ? res.error.join(", ") : res.error) || "Failed to place order.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <form id="checkout-form" className="space-y-6" onSubmit={handleSubmit}>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-stone-950">
            Customer Information
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Full name" name="fullName" placeholder="Your name" required />
            <Input label="Phone" name="phone" placeholder="01700000000" required />
            <div className="sm:col-span-2">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-stone-950">
            Delivery Address
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Division" name="division" placeholder="Dhaka" required />
            <Input label="District" name="district" placeholder="Dhaka" required />
            <Input label="Upazila" name="upazila" placeholder="Dhanmondi" required />
            <Input label="Postal code" name="postalCode" placeholder="1209" />
            <div className="sm:col-span-2">
              <Input
                label="Address line"
                name="addressLine"
                placeholder="House, road, area"
                required
              />
            </div>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">
                Order note (Optional)
              </span>
              <textarea
                name="orderNote"
                rows={4}
                placeholder="Delivery instructions or product notes"
                className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-teal-700"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-stone-950">
            Payment Method
          </h2>
          <label className="mt-5 flex cursor-pointer gap-3 rounded-lg border border-teal-700 bg-teal-50 p-4">
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              defaultChecked
              className="mt-1 text-teal-600 focus:ring-teal-500"
            />
            <span>
              <span className="block font-semibold text-stone-950">
                Cash on Delivery
              </span>
              <span className="mt-1 block text-sm leading-6 text-stone-600">
                Pay with cash when your EcoMarche order arrives.
              </span>
            </span>
          </label>
        </section>
      </form>

      <aside className="rounded-lg border border-stone-200 bg-white p-5 lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-xl font-semibold text-stone-950">Order Summary</h2>

        <div className="mt-5 space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {cartItems.map((item) => {
            const product = item.product || item;
            const price = product.discountPrice ?? product.price;
            return (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-stone-100">
                  <Image
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-stone-950 truncate">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-stone-600">
                    {item.selectedSize || 'Size N/A'} | {item.selectedColor || 'Color N/A'} | Qty {item.quantity}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-950">
                    ${(price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
          
          {cartItems.length === 0 && (
            <p className="text-sm text-stone-500 italic">No items in cart</p>
          )}
        </div>

        <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
          <SummaryRow label="Subtotal" value={subtotal} />
          <SummaryRow label="Delivery charge" value={deliveryCharge} />
          {discount > 0 && <SummaryRow label="Discount" value={discount} isDiscount />}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-5">
          <span className="font-semibold text-stone-950">Total</span>
          <span className="text-xl font-bold text-stone-950">${total.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={submitting || cartItems.length === 0}
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Processing..." : "Place Order"}
        </button>
      </aside>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: number;
  isDiscount?: boolean;
};

function SummaryRow({ label, value, isDiscount = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between text-stone-600">
      <span>{label}</span>
      <span>
        {isDiscount ? "-" : ""}${value.toFixed(2)}
      </span>
    </div>
  );
}
