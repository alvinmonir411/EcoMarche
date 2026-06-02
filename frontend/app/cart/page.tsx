"use client";

import { useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { couponApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { ECOMARCHE_PLACEHOLDER } from "@/utils/fashionImages";

function CartLineImage({ src, alt }: { src?: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(getImageUrl(src));

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="160px"
      onError={() => setImageSrc(ECOMARCHE_PLACEHOLDER)}
      className="object-cover transition-transform duration-[2s] group-hover:scale-105"
    />
  );
}

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    totalPrice, 
    subtotal,
    shipping,
    coupon, 
    applyCoupon, 
    removeCoupon, 
    discountAmount,
    isLoading,
    error: cartError,
    successMessage: cartSuccess
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await couponApi.apply(couponInput);
      if (res.success && res.data) {
        applyCoupon(res.data);
        setCouponSuccess(`Coupon "${couponInput}" applied successfully!`);
        setCouponInput("");
      } else {
        const message = Array.isArray(res.error) ? res.error.join(", ") : (res.error as string);
        setCouponError(message || "Invalid coupon code.");
      }
    } catch {
      setCouponError("An error occurred. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (isLoading && cart.length === 0) {
    return (
      <div className="py-40 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your shopping bag...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-40 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-4">Your shopping bag is empty</h2>
        <p className="text-gray-500 mb-10">Seems like you haven&apos;t added any sustainable pieces yet.</p>
        <Link href="/shop"><Button size="lg">Explore Collection</Button></Link>
      </div>
    );
  }

  return (
    <div className="py-24 bg-white min-h-screen text-secondary">
      <Container>
        <div className="flex justify-between items-end mb-16 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Shopping Bag</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{cart.length} items</p>
          </div>
          <button 
            onClick={() => clearCart()}
            className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors underline decoration-transparent hover:decoration-secondary underline-offset-4"
            disabled={isLoading}
          >
            Clear Bag
          </button>
        </div>

        {cartError && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest text-center">
            {cartError}
          </div>
        )}

        {cartSuccess && (
          <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest text-center">
            {cartSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-10">
            <div className={`transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-10">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-8 group">
                    <div className="relative w-32 md:w-40 aspect-[3/4] bg-[#f8f8f8] overflow-hidden shrink-0">
                      <CartLineImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg md:text-xl font-bold text-secondary">{item.name}</h3>
                          <p className="text-lg font-black text-secondary">${(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                          {item.size && `Size: ${item.size}`} {item.size && item.color && ' | '} {item.color && `Color: ${item.color}`}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-gray-200 h-10 w-28">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="flex-1 h-full flex items-center justify-center text-secondary hover:bg-gray-50 transition-all disabled:opacity-30"
                          >-</button>
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="flex-1 h-full flex items-center justify-center text-secondary hover:bg-gray-50 transition-all"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors disabled:opacity-50 underline underline-offset-4"
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {subtotal < 150 && (
                <div className="mt-12 bg-[#f8f8f8] p-6 text-center">
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                    You are ${Number(150 - subtotal).toFixed(2)} away from Free Shipping
                  </p>
                  <div className="w-full max-w-md mx-auto h-1 bg-gray-200 mt-4 overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: `${(subtotal / 150) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8f8f8] p-10 lg:p-12 sticky top-32">
              <h3 className="text-2xl font-black text-secondary mb-10 tracking-tight">Order Summary</h3>
              
              <div className="space-y-6 mb-10 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold text-secondary">${Number(subtotal || 0).toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-secondary">
                    <span className="font-bold uppercase tracking-widest text-[10px]">Discount ({coupon?.code})</span>
                    <span className="font-bold">-${Number(discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Shipping</span>
                  <span className="font-bold text-secondary uppercase text-[10px] tracking-widest">{shipping === 0 ? 'Free' : `$${Number(shipping).toFixed(2)}`}</span>
                </div>
                <div className="pt-8 border-t border-gray-200 mt-8">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold uppercase tracking-widest text-secondary">Estimated Total</span>
                    <span className="text-4xl font-black text-secondary leading-none">${Number(totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Promo Code */}
              <div className="mb-10">
                {coupon ? (
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200">
                    <div>
                      <p className="text-sm font-bold text-secondary">{coupon.code}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Applied</p>
                    </div>
                    <button onClick={removeCoupon} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-secondary underline underline-offset-4">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Promo Code</label>
                    <div className="flex border border-gray-300 bg-white">
                      <input 
                        type="text" 
                        placeholder="Enter code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-secondary focus:outline-none uppercase"
                      />
                      <button 
                        onClick={handleApplyCoupon} 
                        disabled={couponLoading || !couponInput} 
                        className="px-6 py-3 text-[10px] font-black tracking-widest uppercase text-secondary hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-3">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-3">{couponSuccess}</p>}
              </div>
              
              <div className="space-y-4">
                <Link href={cart.length > 0 ? "/checkout" : "#"} className="block w-full">
                  <Button size="lg" className="w-full h-16 text-xs font-black tracking-[0.2em] uppercase bg-secondary text-white hover:bg-black rounded-none" disabled={cart.length === 0 || isLoading}>
                    Proceed to Checkout
                  </Button>
                </Link>
                <div className="flex justify-center mt-6">
                   <div className="flex items-center gap-4 text-gray-300">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4A2 2 0 002 6v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H4V6h16v12zM4 10h16v2H4z"/></svg>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
