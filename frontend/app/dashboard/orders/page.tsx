"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Link from "next/link";
import { orderApi } from "@/services/api";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderApi.getMyOrders();
        if (res.success) {
          const data = res.data;
          setOrders(Array.isArray(data) ? data : (data?.orders || data?.data || []));
        } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Failed to load your orders.");
        }
      } catch (err) {
        setError("An error occurred while fetching orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <DashboardSidebar />
          
          <main className="flex-1">
            <header className="mb-12">
              <h1 className="text-4xl font-bold text-secondary mb-2">My Orders</h1>
              <p className="text-gray-500">Track and manage your order history.</p>
            </header>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Order ID</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Items</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Total</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {Array.isArray(orders) && orders.map((order) => (
                      <tr key={order.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-8 py-6">
                          <span className="font-bold text-primary">
                            #ORD-{order.id?.toString().slice(-6) || order._id?.toString().slice(-6) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-500 font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-6 text-gray-500 font-medium">{order.items?.length || 0} items</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-secondary">${Number(order.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-8 py-6 text-right">
                          <Link 
                            href={`/dashboard/orders/${order.id}`}
                            className="text-xs font-bold text-secondary bg-accent/20 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {(!Array.isArray(orders) || orders.length === 0) && !error && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-secondary">No orders found</h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-4">Seems like you haven't placed any orders yet. Explore our collection and find something you love!</p>
                            <Link href="/shop" className="text-sm font-bold text-primary uppercase tracking-widest hover:underline">Start shopping today</Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
