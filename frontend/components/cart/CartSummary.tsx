import Link from "next/link";

type CartSummaryProps = {
  subtotal: number;
  deliveryCharge: number;
  discount: number;
};

export function CartSummary({
  subtotal,
  deliveryCharge,
  discount,
}: CartSummaryProps) {
  const total = subtotal + deliveryCharge - discount;

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-5 lg:sticky lg:top-28">
      <h2 className="text-lg font-bold text-stone-950">Order Summary</h2>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-stone-700">Coupon code</span>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <input
            name="coupon"
            placeholder="ECO20"
            className="min-h-11 flex-1 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
          />
          <button
            type="button"
            className="min-h-11 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Apply
          </button>
        </div>
      </label>

      <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label="Delivery charge" value={deliveryCharge} />
        <SummaryRow label="Discount" value={discount} isDiscount />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-5">
        <span className="font-semibold text-stone-950">Total</span>
        <span className="text-xl font-bold text-stone-950">${total}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Proceed to Checkout
      </Link>
    </aside>
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
        {isDiscount ? "-" : ""}${value}
      </span>
    </div>
  );
}
