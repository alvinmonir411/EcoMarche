"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Link from "next/link";
import { orderApi, authApi } from "@/services/api";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, orderRes] = await Promise.all([
          authApi.getProfile(),
          orderApi.getMyOrders()
        ]);

        if (userRes.success) setUser(userRes.data);
        if (orderRes.success) {
          const data = orderRes.data;
          setOrders(Array.isArray(data) ? data : (data?.orders || data?.data || []));
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Orders", value: (orders?.length || 0).toString().padStart(2, '0'), icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { label: "Processing", value: (orders?.filter(o => o.status === 'PROCESSING').length || 0).toString().padStart(2, '0'), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: "Wishlist", value: "00", icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ];

  if (loading) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              <h1 className="text-4xl font-bold text-secondary mb-2">Hello, {user?.name || 'User'}!</h1>
              <p className="text-gray-500">Welcome to your personal dashboard. Here you can manage your orders and profile.</p>
            </header>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white p-8 rounded-[32px] shadow-sm border border-accent/20 flex items-center gap-6 group hover:border-primary/30 transition-all">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-secondary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Recent Orders */}
              <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
                <div className="p-8 border-b border-accent/10 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-secondary">Recent Orders</h3>
                  <Link href="/dashboard/orders" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Order</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/10">
                      {Array.isArray(orders) && orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-accent/5 transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-bold text-secondary">#ORD-{order.id?.toString().slice(-4) || order._id?.toString().slice(-4) || 'N/A'}</span>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-bold text-secondary">${Number(order.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                      {(!Array.isArray(orders) || orders.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest">No orders yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Account Overview Card */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-accent/20">
                  <h3 className="text-xl font-bold text-secondary mb-6">Default Address</h3>
                  <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 relative">
                    <h4 className="font-bold text-secondary mb-2">{user?.name}</h4>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                      {user?.address || "No address saved yet."}
                    </p>
                    <Link href="/dashboard/addresses" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Manage Addresses</Link>
                  </div>
                </div>

                <div className="bg-primary p-8 rounded-[32px] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                  <h3 className="text-2xl font-bold mb-4 relative z-10">Eco Rewards</h3>
                  <p className="text-primary-foreground/70 text-sm mb-6 relative z-10 leading-relaxed">
                    You've saved **12.5kg of CO2** by shopping sustainable. Reach 20kg to unlock a **$50 voucher!**
                  </p>
                  <div className="w-full bg-white/20 h-2 rounded-full mb-2 overflow-hidden relative z-10">
                    <div className="bg-white h-full w-[62%]"></div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">62% to next reward</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
