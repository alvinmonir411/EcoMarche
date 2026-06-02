import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-stone-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl shadow-stone-200/50 border border-stone-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="mt-6 text-2xl font-bold text-stone-900 tracking-tight">
          Order placed successfully!
        </h1>
        
        <p className="mt-3 text-sm text-stone-600 leading-relaxed">
          Thank you for shopping with EcoMarche. We&apos;ve received your order and are getting it ready to ship. 
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/dashboard/orders">
            <Button className="w-full justify-center">Track My Order</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary" className="w-full justify-center">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
