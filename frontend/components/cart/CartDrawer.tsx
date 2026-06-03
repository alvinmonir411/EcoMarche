"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/utils/image";
import { ECOMARCHE_PLACEHOLDER } from "@/utils/fashionImages";
import Button from "../ui/Button";

function CartDrawerItemImage({ src, alt }: { src?: string; alt: string }) {
  const [imageSrc, setImageSrc] = React.useState(getImageUrl(src));
  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="80px"
      onError={() => setImageSrc(ECOMARCHE_PLACEHOLDER)}
      className="object-cover"
    />
  );
}

export default function CartDrawer() {
  const { isCartOpen, closeCart, cart, updateQuantity, removeFromCart, subtotal, isLoading } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-secondary tracking-tight">Shopping Bag ({cart.length})</h2>
          <button 
            onClick={closeCart}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-secondary hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <p className="text-gray-500 font-medium">Your bag is empty.</p>
              <Button onClick={closeCart}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className={`flex gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="relative w-20 aspect-[3/4] bg-gray-50 shrink-0">
                    <CartDrawerItemImage src={item.image} alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-secondary text-sm leading-tight line-clamp-2">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                      </p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-gray-200 h-8 w-20">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="flex-1 h-full flex items-center justify-center text-secondary hover:bg-gray-50">-</button>
                        <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 h-full flex items-center justify-center text-secondary hover:bg-gray-50">+</button>
                      </div>
                      <span className="font-black text-secondary text-sm">৳{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
              <span className="text-xl font-black text-secondary">৳{Number(subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <Link href="/cart" onClick={closeCart} className="block w-full">
                <Button variant="outline" className="w-full justify-center">View Full Bag</Button>
              </Link>
              <Link href="/checkout" onClick={closeCart} className="block w-full">
                <Button className="w-full justify-center">Checkout Now</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
