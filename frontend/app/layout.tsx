import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

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
          <main className="min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
          <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
