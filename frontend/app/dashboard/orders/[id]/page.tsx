"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Container from "@/components/ui/Container";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { orderApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await orderApi.getById(id);
        if (res.success) {
          setOrder(res.data);
        } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Order not found.");
        }
      } catch (err) {
        setError("An error occurred while fetching order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-40 text-center px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-secondary mb-4">{error || "Order Not Found"}</h2>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">We couldn't retrieve the details for this order. It might have been deleted or moved.</p>
        <Link href="/dashboard/orders"><Button size="lg">Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <DashboardSidebar />
          
          <main className="flex-1">
            <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Link href="/dashboard/orders" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all mb-4 block">← Back to Orders</Link>
                <h1 className="text-4xl font-bold text-secondary">
                  Order #ORD-{(order.id || order._id)?.toString().slice(-6).toUpperCase()}
                </h1>
                <p className="text-gray-500 mt-1">
                  Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="hidden sm:inline-flex">Download Invoice</Button>
                <Button>Track Order</Button>
              </div>
            </header>

            {/* Order Status Tracker */}
            <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-accent/20 mb-12 overflow-x-auto">
              <div className="flex justify-between items-center relative min-w-[600px] px-10">
                <div className="absolute top-[20px] left-[60px] right-[60px] h-1 bg-accent/20 -z-0"></div>
                <div className="absolute top-[20px] left-[60px] h-1 bg-primary -z-0 transition-all duration-1000" 
                     style={{ width: `calc(${order.status === 'DELIVERED' ? '100%' : order.status === 'SHIPPED' ? '66%' : order.status === 'PROCESSING' ? '33%' : '0%'} - 120px)` }}></div>
                
                {[
                  { label: "Order Placed", active: true },
                  { label: "Processing", active: order.status !== 'CANCELLED' && order.status !== 'PENDING' },
                  { label: "Shipped", active: order.status === 'SHIPPED' || order.status === 'DELIVERED' },
                  { label: "Delivered", active: order.status === 'DELIVERED' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step.active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-400 border-2 border-accent/20'
                    }`}>
                      {step.active ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : i + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-3 whitespace-nowrap ${step.active ? 'text-secondary' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              <div className="xl:col-span-2 space-y-8">
                {/* Items List */}
                <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
                  <div className="p-8 border-b border-accent/10">
                    <h3 className="text-xl font-bold text-secondary">Items in this order</h3>
                  </div>
                  <div className="p-8 space-y-8">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-6 group">
                        <div className="relative w-20 h-24 bg-accent/10 rounded-2xl overflow-hidden flex-shrink-0">
                          <Image
                            src={getImageUrl(item.product?.imageUrl || item.product?.image || getProductFallbackImage(item.product?.slug || item.product?.id || item.product?.name))}
                            alt={item.product?.name || "Product image"}
                            fill
                            sizes="80px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-secondary">{item.product?.name || "Product Name"}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-secondary">${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1 space-y-8">
                {/* Shipping & Payment Summary */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-accent/20">
                  <h3 className="text-xl font-bold text-secondary mb-8">Order Summary</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h4>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {order.shippingAddress || "No address provided"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Info</h4>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-accent/10 rounded-lg text-[10px] font-bold text-secondary uppercase tracking-widest">
                          {order.paymentMethod?.replace(/_/g, ' ') || 'COD'}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-gold'}`}>
                          {order.paymentStatus || 'PENDING'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-accent/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Subtotal</span>
                        <span className="font-bold text-secondary">${Number((order.totalAmount || 0) - (order.deliveryCharge || 0) + (order.discountAmount || 0)).toFixed(2)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between items-center mb-2 text-green-600">
                          <span className="text-sm font-medium">Discount</span>
                          <span className="font-bold">-${Number(order.discountAmount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Shipping</span>
                        <span className="font-bold text-green-600 tracking-widest">
                          {Number(order.deliveryCharge || 0) === 0 ? 'FREE' : `$${Number(order.deliveryCharge).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t border-accent/10 mt-4">
                        <span className="text-secondary">Total</span>
                        <span className="text-primary">${Number(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
