import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FastLain | Naturally Yours",
  description: "Shop premium dresses, clothing, and modern sustainable fashion at FastLain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
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
