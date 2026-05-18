"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { orderApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { FASTLAIN_PLACEHOLDER } from "@/utils/fashionImages";

function CheckoutLineImage({ src, alt }: { src?: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(getImageUrl(src));

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="80px"
      onError={() => setImageSrc(FASTLAIN_PLACEHOLDER)}
      className="object-cover"
    />
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, coupon, discountAmount, subtotal, shipping, totalPrice } = useCart();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    paymentMethod: "cash_on_delivery"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync user info from localStorage if available
  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          firstName: user.name?.split(' ')[0] || "",
          lastName: user.name?.split(' ').slice(1).join(' ') || "",
          email: user.email || ""
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Prepare order data for backend DTO - ONLY send fields expected by the backend
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        deliveryCharge: shipping,
        paymentMethod: formData.paymentMethod,
        couponCode: coupon?.code || undefined,
      };

      const res = await orderApi.create(orderData);
      if (res.success) {
        // Clear local cart state
        await clearCart();
        // Redirect to order success page
        router.push("/order-success");
      } else {
        // Handle error response from backend
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || res.message || "Failed to place order.");
        setError(errMsg);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("An unexpected error occurred. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="py-40 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-4">Your bag is empty</h2>
        <p className="text-gray-500 mb-8">Add some items to your bag before checking out.</p>
        <Link href="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="py-24 bg-white min-h-screen text-secondary">
      <Container>
        {/* Progress Header */}
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
             <Link href="/cart" className="hover:text-secondary transition-colors">Bag</Link>
             <span className="w-8 h-[1px] bg-gray-200"></span>
             <span className="text-secondary">Checkout</span>
             <span className="w-8 h-[1px] bg-gray-200"></span>
             <span>Complete</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-16 border-b border-gray-100 pb-8">
           <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Secure Checkout</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Provide your details to complete the order</p>
           </div>
        </div>

        {error && (
          <div className="mb-10 p-6 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Shipping Form & Payment */}
          <div className="lg:col-span-7 space-y-16">
            
            {/* 1. Contact Information */}
            <div className="space-y-8">
              <h3 className="text-xl font-black text-secondary uppercase tracking-widest">1. Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Name</label>
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Name</label>
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="space-y-8">
              <h3 className="text-xl font-black text-secondary uppercase tracking-widest border-t border-gray-100 pt-16">2. Delivery</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Street Address</label>
                <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">City</label>
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">State</label>
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ZIP Code</label>
                  <input type="text" name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} required className="w-full bg-[#f8f8f8] border border-transparent focus:border-secondary px-5 py-4 text-sm font-bold transition-all outline-none" />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="space-y-8">
              <h3 className="text-xl font-black text-secondary uppercase tracking-widest border-t border-gray-100 pt-16">3. Payment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'cash_on_delivery', title: 'Cash on Delivery', desc: 'Pay when you receive' },
                  { id: 'bkash', title: 'bKash', desc: 'Mobile wallet' },
                  { id: 'nagad', title: 'Nagad', desc: 'Mobile wallet' },
                  { id: 'sslcommerz', title: 'SSLCommerz', desc: 'Cards & Net Banking' }
                ].map(method => (
                  <label key={method.id} className={`flex flex-col p-6 cursor-pointer transition-all border ${formData.paymentMethod === method.id ? 'border-secondary bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method.id ? 'border-secondary' : 'border-gray-300'}`}>
                        {formData.paymentMethod === method.id && <div className="w-2 h-2 bg-secondary rounded-full"></div>}
                      </div>
                      <span className="font-bold text-secondary">{method.title}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-7">{method.desc}</p>
                    <input type="radio" name="paymentMethod" value={method.id} className="hidden" checked={formData.paymentMethod === method.id} onChange={handleChange} />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Review & Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8f8f8] p-10 lg:p-12 sticky top-32">
              <h3 className="text-2xl font-black text-secondary mb-10 tracking-tight">Order Details</h3>
              
              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 hide-scrollbar border-b border-gray-200 pb-10">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-6">
                    <div className="relative w-20 aspect-[3/4] bg-white overflow-hidden shrink-0 border border-gray-100">
                      <CheckoutLineImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-secondary leading-tight mb-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                        Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                      </p>
                      <span className="font-black text-secondary">${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

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

              <Button 
                type="submit"
                size="lg" 
                disabled={loading || cart.length === 0}
                className="w-full h-16 text-xs font-black tracking-[0.2em] uppercase bg-secondary text-white hover:bg-black rounded-none"
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure 256-bit SSL Encryption
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
