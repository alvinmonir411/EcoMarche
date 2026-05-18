"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { paymentApi } from "@/services/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentApi.getAll();
        if (res.success) {
          const data = res.data;
          setPayments(Array.isArray(data) ? data : (data?.payments || data?.data || []));
        } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Failed to load payments.");
        }
      } catch (err) {
        setError("An error occurred while fetching payments.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

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
              <h1 className="text-4xl font-bold text-secondary mb-2">Transactions</h1>
              <p className="text-gray-500">Monitor and manage all financial transactions and payments.</p>
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
                      <th className="px-8 py-5">Transaction ID</th>
                      <th className="px-8 py-5">Order</th>
                      <th className="px-8 py-5">Method</th>
                      <th className="px-8 py-5">Amount</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {Array.isArray(payments) && payments.map((txn) => (
                      <tr key={txn.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-8 py-6">
                           <span className="font-mono text-xs font-bold text-gray-500">
                             {txn.transactionId || txn.id?.toString().slice(-8).toUpperCase() || "N/A"}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-bold text-primary">#{txn.orderId?.toString().slice(-6) || 'N/A'}</span>
                           <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                             {txn.user?.name || txn.customerName || "Customer"}
                           </p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-4 bg-accent/20 rounded-sm"></div>
                             <span className="font-medium text-gray-600 capitalize">{txn.paymentMethod?.replace('_', ' ') || 'Unknown'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-secondary">${Number(txn.amount || 0).toFixed(2)}</td>
                        <td className="px-8 py-6 text-gray-400 font-medium">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            txn.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                            txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!Array.isArray(payments) || payments.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest">
                          No transactions found
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
