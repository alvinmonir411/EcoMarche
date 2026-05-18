"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { adminApi } from "@/services/api";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.getOrders();
        if (res.success) {
          const data = res.data;
          setOrders(Array.isArray(data) ? data : (data?.orders || data?.data || []));
        } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Failed to load orders.");
        }
      } catch (err) {
        setError("An error occurred while fetching orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = 
      order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All Status" || order.status === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  }) : [];

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
          <AdminSidebar />
          
          <main className="flex-1">
            <header className="mb-12">
              <h1 className="text-4xl font-bold text-secondary mb-2">Order Management</h1>
              <p className="text-gray-500">Track and manage customer orders across your store.</p>
            </header>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold">
                {error}
              </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
              <div className="p-8 border-b border-accent/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                 <div className="relative w-full sm:w-96">
                  <input 
                    type="text" 
                    placeholder="Search by Order ID or Customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-accent/5 border border-accent/20 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                   <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-none bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary"
                   >
                     <option>All Status</option>
                     <option>Pending</option>
                     <option>Processing</option>
                     <option>Shipped</option>
                     <option>Delivered</option>
                     <option>Cancelled</option>
                   </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Order ID</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Customer</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Total</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-8 py-6">
                           <span className="font-bold text-primary">#{order.id?.toString().slice(-6)}</span>
                        </td>
                        <td className="px-8 py-6 text-gray-400 font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-6 font-bold text-secondary">
                          {order.customerName || order.user?.name || "Guest"}
                          <p className="text-[10px] font-medium text-gray-400">{order.customerEmail || order.user?.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                            order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' : 
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-secondary">${Number(order.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-8 py-6 text-right">
                          <Link 
                            href={`/admin/orders/${order.id}`}
                            className="text-xs font-bold text-secondary bg-accent/20 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                          >
                             Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-10 text-center text-gray-400 font-bold tracking-widest uppercase">
                          No orders found
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
