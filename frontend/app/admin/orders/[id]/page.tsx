"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { orderApi, adminApi, paymentApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string | string[], type: "success" | "error" = "success") => {
    const text = Array.isArray(message) ? message[0] : message;
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    const res = await orderApi.getAdminOrderById(id);
    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setError(Array.isArray(res.error) ? res.error[0] : res.error || "Failed to load order details.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const handleOrderStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) return;

    setUpdatingOrderStatus(true);
    const res = await adminApi.updateOrderStatus(id, { orderStatus: newStatus });
    if (res.success) {
      showToast("Order status updated successfully!", "success");
      await fetchOrderDetails();
    } else {
      showToast(res.error || "Failed to update order status.", "error");
    }
    setUpdatingOrderStatus(false);
  };

  const handlePaymentStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!window.confirm(`Are you sure you want to change payment status to ${newStatus}?`)) return;

    setUpdatingPaymentStatus(true);
    const res = await adminApi.updateOrderStatus(id, { paymentStatus: newStatus });
    if (res.success) {
      showToast("Payment status updated successfully!", "success");
      await fetchOrderDetails();
    } else {
      showToast(res.error || "Failed to update payment status.", "error");
    }
    setUpdatingPaymentStatus(false);
  };

  const handleCopyCustomerInfo = () => {
    const info = `Name: ${order.customerName || order.user?.name || 'Guest User'}\nPhone: ${order.customerPhone || 'N/A'}\nEmail: ${order.customerEmail || order.user?.email || 'N/A'}\nAddress: ${order.shippingAddress || 'No address provided'}`;
    navigator.clipboard.writeText(info);
    showToast("Customer info copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32 bg-stone-50 min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-teal-700"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">{error || "Order not found"}</h1>
        <Link href="/admin/orders" className="mt-6 inline-block text-teal-700 font-medium hover:underline">
          &larr; Back to Orders List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f5] pb-20 print:bg-white print:pb-0">
      
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-24 right-4 z-[100] px-6 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300 flex items-center gap-3 print:hidden ${toastType === "success" ? "bg-primary text-white" : "bg-red-600 text-white"}`}>
          {toastType === "success" ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-8 sm:px-6 lg:px-8 print:border-none print:py-4">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4 print:hidden">
              <Link href="/admin/orders" className="px-5 py-2.5 bg-white border border-gray-100 shadow-sm rounded-xl text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Orders
              </Link>
            </div>
            <h1 className="text-3xl font-black text-secondary tracking-tighter">Order #{order.id?.toString().slice(-6) || order.id}</h1>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Placed on {new Date(order.createdAt || Date.now()).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
             <button onClick={() => window.print()} className="print:hidden px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-secondary uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
               Print Order
             </button>
             <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm print:border print:border-gray-300 ${
               (order.orderStatus || order.status)?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' : 
               (order.orderStatus || order.status)?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' : 
               'bg-yellow-100 text-yellow-700'
             }`}>
                {order.orderStatus || order.status || 'PENDING'}
             </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-4 print:px-0">
        <div className="grid lg:grid-cols-12 gap-10 print:flex print:flex-col print:gap-6">
          
          {/* Left Side: 70% (8 cols) */}
          <div className="lg:col-span-8 space-y-8 print:space-y-6 print:w-full">
            
            {/* Customer & Shipping Information */}
            <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8 sm:p-10 print:rounded-none print:shadow-none print:border-t-2 print:border-b-2 print:border-black print:p-4">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-4 print:border-gray-300">
                <h2 className="text-xl font-black text-secondary print:text-black">Customer & Delivery Information</h2>
                <button onClick={handleCopyCustomerInfo} className="print:hidden text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:text-secondary transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy Info
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-10 print:gap-4">
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 print:text-black print:font-black">Customer Details</h3>
                    <div className="space-y-3">
                      <p className="font-bold text-secondary text-lg print:text-black">{order.customerName || order.user?.name || 'Guest User'}</p>
                      <div className="flex items-center gap-3 text-gray-500 font-medium text-sm print:text-black">
                         <svg className="w-5 h-5 text-gray-400 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                         {order.customerEmail || order.user?.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 font-medium text-sm print:text-black">
                         <svg className="w-5 h-5 text-gray-400 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                         {order.customerPhone || 'N/A'}
                      </div>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 print:text-black print:font-black">Shipping Address</h3>
                    <div className="flex items-start gap-3 text-gray-500 font-medium text-sm bg-accent/10 p-5 rounded-2xl border border-accent/20 h-full print:bg-transparent print:border-none print:p-0 print:text-black">
                       <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       <p className="leading-relaxed">{order.shippingAddress || 'No address provided'}</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8 sm:p-10 print:rounded-none print:shadow-none print:border-none print:p-4">
              <h2 className="text-xl font-black text-secondary mb-8 border-b border-gray-100 pb-4 print:text-black print:border-black">Ordered Items ({order.items?.length || 0})</h2>
              <div className="space-y-6 print:space-y-4">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl hover:bg-accent/5 transition-colors border border-transparent hover:border-accent/10 print:border-b print:border-gray-200 print:rounded-none print:p-2 print:pb-4">
                    <div className="relative h-24 w-20 bg-accent/20 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm print:hidden">
                      <Image
                        src={getImageUrl(item.product?.thumbnail || item.product?.imageUrl || item.product?.imageUrls?.[0] || item.imageUrl || getProductFallbackImage(item.product?.slug || item.product?.id || item.productName))}
                        alt={item.productName || item.product?.name || "Product image"}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-base font-bold text-secondary mb-1 print:text-black">{item.productName || item.product?.name || 'Unknown Product'}</h3>
                      <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 print:text-black">
                        {item.size && <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 print:border-none print:p-0">Size: {item.size}</span>}
                        {item.color && <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 print:border-none print:p-0">Color: {item.color}</span>}
                        <span className="bg-primary/5 text-primary px-2 py-1 rounded-md shadow-sm border border-primary/10 print:border-none print:p-0 print:text-black">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end font-black text-secondary text-lg mt-4 sm:mt-0 print:text-black print:mt-0">
                      ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      <span className="text-[10px] font-bold text-gray-400 block mt-1 uppercase tracking-widest print:text-black">${Number(item.price || 0).toFixed(2)} each</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Side: 30% (4 cols) - Sticky */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start print:w-full print:space-y-4">
            
            {/* Order Summary */}
            <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8 print:rounded-none print:shadow-none print:border-t-2 print:border-black print:p-4">
              <h2 className="text-xl font-black text-secondary mb-6 border-b border-gray-100 pb-4 print:text-black">Order Summary</h2>
              <div className="space-y-4 text-sm text-gray-500 font-medium border-b border-gray-100 pb-6 mb-6 print:text-black print:border-gray-300">
                <div className="flex justify-between items-center">
                   <span>Subtotal</span>
                   <span className="font-bold text-secondary print:text-black">${Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span>Delivery Charge</span>
                   <span className="font-bold text-secondary print:text-black">${Number(order.deliveryCharge || 0).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                   <div className="flex justify-between items-center text-green-600 print:text-black">
                     <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                     <span className="font-bold">-${Number(order.discount || 0).toFixed(2)}</span>
                   </div>
                )}
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest print:text-black">Total Amount</span>
                <span className="text-3xl font-black text-primary print:text-black">${Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Admin Management Controls */}
            <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8 print:hidden">
              <h2 className="text-xl font-black text-secondary mb-6 border-b border-gray-100 pb-4">Management</h2>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Status</label>
                    <div className="relative">
                       <select 
                          value={(order.orderStatus || order.status || 'pending').toLowerCase()} 
                          onChange={handleOrderStatusChange}
                          disabled={updatingOrderStatus}
                          className="w-full bg-accent/5 border border-accent/20 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                       >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                       </select>
                       <svg className={`w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${updatingOrderStatus ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                       {updatingOrderStatus && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                           <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                         </div>
                       )}
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Status</label>
                    <div className="relative">
                       <select 
                          value={(order.paymentStatus || 'pending').toLowerCase()} 
                          onChange={handlePaymentStatusChange}
                          disabled={updatingPaymentStatus}
                          className="w-full bg-accent/5 border border-accent/20 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                       >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                       </select>
                       <svg className={`w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${updatingPaymentStatus ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                       {updatingPaymentStatus && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                           <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Method</span>
                    <div className="flex items-center gap-3 text-sm font-bold text-secondary bg-accent/5 p-4 rounded-2xl border border-accent/10">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <span className="capitalize">{order.paymentMethod?.replace(/_/g, ' ').toLowerCase() || 'Cash on Delivery'}</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
