"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { adminApi } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getOrders()
        ]);
        
        if (statsRes.success) {
          setStats(statsRes.data?.stats || statsRes.data);
        }
        if (ordersRes.success) {
          setAllOrders(ordersRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `$${Number(stats?.totalSales || stats?.totalRevenue || 0).toFixed(2)}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: "Total Orders", value: stats?.totalOrders || '0', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { label: "Total Customers", value: stats?.totalCustomers || stats?.totalUsers || '0', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: "Total Products", value: stats?.totalProducts || '0', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  ];

  // Calculated Status Metrics
  const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending').length;
  const processingOrders = allOrders.filter(o => o.orderStatus === 'processing').length;
  const deliveredOrders = allOrders.filter(o => o.orderStatus === 'delivered').length;
  const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid').length;
  const unpaidOrders = allOrders.filter(o => o.paymentStatus !== 'paid').length;

  const orderMetrics = [
    { label: "Pending", count: pendingOrders, status: "pending", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" },
    { label: "Processing", count: processingOrders, status: "processing", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
    { label: "Delivered", count: deliveredOrders, status: "delivered", color: "text-green-600", bg: "bg-green-100", border: "border-green-200" },
  ];

  const paymentMetrics = [
    { label: "Paid", count: paidOrders, paymentStatus: "paid", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
    { label: "Unpaid", count: unpaidOrders, paymentStatus: "unpaid", color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  ];

  if (loading) {
    return (
      <div className="py-20 min-h-screen bg-[#f8f8f5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#f8f8f5] min-h-screen">
      <Container>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3">
            <div className="sticky top-28">
              <AdminSidebar />
            </div>
          </div>

          <main className="lg:col-span-9 space-y-10">
            <header className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black text-secondary tracking-tighter">Overview</h1>
                <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Store Performance Metrics</p>
              </div>
              <Link href="/admin/orders" className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors shadow-sm">
                Manage Orders
              </Link>
            </header>

            {/* Core Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-secondary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actionable Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Order Status Cards */}
               <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-secondary uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Order Pipeline</h3>
                  <div className="flex gap-4">
                     {orderMetrics.map((m) => (
                        <div 
                          key={m.label} 
                          onClick={() => router.push(`/admin/orders?status=${m.status}`)}
                          className={`flex-1 p-4 rounded-2xl border ${m.border} ${m.bg} cursor-pointer hover:shadow-md transition-all group`}
                        >
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${m.color} opacity-80 group-hover:opacity-100`}>{m.label}</p>
                           <p className={`text-2xl font-black ${m.color}`}>{m.count}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Payment Status Cards */}
               <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-secondary uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Financial Pipeline</h3>
                  <div className="flex gap-4">
                     {paymentMetrics.map((m) => (
                        <div 
                          key={m.label} 
                          onClick={() => router.push(`/admin/orders?paymentStatus=${m.paymentStatus}`)}
                          className={`flex-1 p-4 rounded-2xl border ${m.border} ${m.bg} cursor-pointer hover:shadow-md transition-all group`}
                        >
                           <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${m.color} opacity-80 group-hover:opacity-100`}>{m.label}</p>
                           <p className={`text-2xl font-black ${m.color}`}>{m.count}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-secondary tracking-tight">Recent Activity</h3>
                <Link href="/admin/orders" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                  View All
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f8f8f5] text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Order & Customer</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Payment</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} className="hover:bg-accent/5 transition-colors cursor-pointer group">
                        <td className="px-8 py-6">
                          <span className="font-bold text-secondary block group-hover:text-primary transition-colors">{order.customerEmail || order.user?.email || "Guest Checkout"}</span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} • #{order.id?.toString().slice(-6) || order.id}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${
                            order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                            order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {order.orderStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {order.paymentStatus || 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-secondary text-base">
                           ${Number(order.total || order.totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {allOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center text-gray-400 font-bold tracking-widest uppercase">No recent sales</td>
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
