import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xl font-bold text-stone-950">
            EcoMarche
          </Link>

          <div className="hidden md:block">
            <Navbar />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Login
            </Link>
            <Link
              href="/cart"
              className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Cart
            </Link>
          </div>
        </div>

        <div className="mt-3 border-t border-stone-100 pt-2 md:hidden">
          <Navbar />
        </div>
      </div>
    </header>
  );
}
