import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { WishlistProvider } from "@/context/WishlistContext";
import FloatingContact from "@/components/ui/FloatingContact";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EcoMarche | Naturally Yours",
  description: "Shop premium dresses, clothing, and modern sustainable fashion at EcoMarche.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <CartProvider>
          <WishlistProvider>
          <Navbar />
          <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
          <main className="min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
          <CartDrawer />
          <FloatingContact />
          <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

