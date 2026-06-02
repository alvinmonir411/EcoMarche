"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { productApi } from "@/services/api";

export default function AdminStockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const updateStock = async (product: any, stock: number) => {
    setSavingId(product.id);
    const res = await productApi.update(product.id, { stock });
    setSavingId(null);

    if (res.success) {
      setProducts((items) => items.map((item) => item.id === product.id ? { ...item, stock } : item));
    } else {
      alert(res.error || "Failed to update stock");
    }
  };

  return (
    <div className="min-h-screen bg-accent/5 py-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <AdminSidebar />
          <main className="flex-1">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-secondary">Stock Management</h1>
              <p className="mt-2 text-sm font-bold text-gray-500">Update inventory counts and watch low-stock products.</p>
            </header>

            <div className="overflow-hidden rounded-[32px] border border-accent/20 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/10">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-gray-400">Loading stock...</td></tr>
                  ) : products.map((product) => (
                    <StockRow key={product.id} product={product} saving={savingId === product.id} onSave={updateStock} />
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

function StockRow({ product, saving, onSave }: { product: any; saving: boolean; onSave: (product: any, stock: number) => void }) {
  const [stock, setStock] = useState(Number(product.stock || 0));

  return (
    <tr>
      <td className="px-6 py-5">
        <span className="block font-black text-secondary">{product.name}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${stock < 10 ? "text-red-500" : "text-gray-400"}`}>
          {stock < 10 ? "Low stock" : "Healthy"}
        </span>
      </td>
      <td className="px-6 py-5 font-mono text-xs text-gray-400">{product.sku}</td>
      <td className="px-6 py-5">
        <input type="number" min={0} value={stock} onChange={(event) => setStock(Number(event.target.value))} className="w-28 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 font-black outline-none focus:border-primary" />
      </td>
      <td className="px-6 py-5 text-right">
        <Button type="button" disabled={saving} onClick={() => onSave(product, stock)}>
          {saving ? "Saving..." : "Update"}
        </Button>
      </td>
    </tr>
  );
}
