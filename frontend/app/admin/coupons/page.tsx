"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { couponApi } from "@/services/api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await couponApi.getAll();
      if (res.success) {
        const data = res.data;
        setCoupons(Array.isArray(data) ? data : (data?.coupons || data?.data || []));
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Failed to load coupons.");
      }
    } catch (err) {
      setError("An error occurred while fetching coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await couponApi.delete(id);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      } else {
        alert(res.error || "Failed to delete coupon");
      }
    } catch (err) {
      alert("An error occurred while deleting coupon");
    }
  };

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
            <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-secondary mb-2">Promotions</h1>
                <p className="text-gray-500">Manage discount codes and promotional offers.</p>
              </div>
              <Link href="/admin/coupons/create">
                <Button size="lg" className="shadow-lg shadow-primary/20">+ Create Coupon</Button>
              </Link>
            </header>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold">
                {error}
              </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Coupon Code</th>
                      <th className="px-8 py-5">Discount</th>
                      <th className="px-8 py-5">Usage</th>
                      <th className="px-8 py-5">Expiry</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {Array.isArray(coupons) && coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="font-bold text-primary font-mono text-lg">{coupon.code}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-secondary">
                            {coupon.type === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                          </span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{coupon.type?.replace('_', ' ')}</p>
                        </td>
                        <td className="px-8 py-6 text-gray-500 font-medium">
                          {coupon.usedCount || 0} / {coupon.maxUsage || '∞'}
                        </td>
                        <td className="px-8 py-6 text-gray-400 font-medium">
                          {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <Link href={`/admin/coupons/edit/${coupon.id}`} className="p-2 bg-accent/10 rounded-lg text-gray-500 hover:bg-primary hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="p-2 bg-accent/10 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!Array.isArray(coupons) || coupons.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest">
                          No coupons found
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
