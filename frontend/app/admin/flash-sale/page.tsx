"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Container from "@/components/ui/Container";
import { productApi } from "@/services/api";

const controls = [
  ["flashSale", "Flash Sale"],
  ["featured", "Featured"],
  ["bestSelling", "Best Selling"],
  ["justForYou", "Just For You"],
  ["newArrival", "New Arrival"],
  ["trending", "Trending"],
] as const;

export default function AdminFlashSalePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const res = await productApi.getAll({ limit: 60 });
    const data = res.success ? res.data : null;
    setProducts(Array.isArray(data) ? data : (data?.products || data?.data || []));
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggle = async (product: any, field: string) => {
    const nextValue = !product[field];
    setProducts((items) => items.map((item) => item.id === product.id ? { ...item, [field]: nextValue } : item));
    const res = await productApi.update(product.id, { [field]: nextValue });
    if (!res.success) {
      setProducts((items) => items.map((item) => item.id === product.id ? { ...item, [field]: !nextValue } : item));
      alert(res.error || "Failed to update product control");
    }
  };

  return (
    <div className="min-h-screen bg-accent/5 py-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <AdminSidebar />
          <main className="flex-1">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-secondary">Homepage Product Controls</h1>
              <p className="mt-2 text-sm font-bold text-gray-500">Toggle flash sale, featured, best selling, just-for-you, new arrival, and trending flags.</p>
            </header>

            <div className="overflow-hidden rounded-[32px] border border-accent/20 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    {controls.map(([, label]) => <th key={label} className="px-4 py-4 text-center">{label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/10">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center font-bold text-gray-400">Loading products...</td></tr>
                  ) : products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-5 font-black text-secondary">{product.name}</td>
                      {controls.map(([field, label]) => (
                        <td key={field} className="px-4 py-5 text-center">
                          <button
                            type="button"
                            onClick={() => toggle(product, field)}
                            aria-label={`Toggle ${label}`}
                            className={`mx-auto flex h-8 w-14 items-center rounded-full p-1 transition-colors ${product[field] ? "bg-primary" : "bg-gray-200"}`}
                          >
                            <span className={`h-6 w-6 rounded-full bg-white transition-transform ${product[field] ? "translate-x-6" : "translate-x-0"}`} />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
