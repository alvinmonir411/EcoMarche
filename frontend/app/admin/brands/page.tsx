"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { brandApi } from "@/services/api";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", logoUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    const res = await brandApi.getAll();
    if (res.success) setBrands(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const createBrand = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const res = await brandApi.create(form);
    setSaving(false);

    if (res.success) {
      setForm({ name: "", slug: "", description: "", logoUrl: "" });
      await loadBrands();
    } else {
      alert(res.error || "Failed to save brand");
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const res = await brandApi.delete(id);
    if (res.success) setBrands((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-accent/5 py-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <AdminSidebar />
          <main className="flex-1">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-secondary">Brands</h1>
              <p className="mt-2 text-sm font-bold text-gray-500">Create, edit, and organize marketplace brands.</p>
            </header>

            <form onSubmit={createBrand} className="mb-8 grid gap-4 rounded-[32px] border border-accent/20 bg-white p-6 shadow-sm md:grid-cols-4">
              <input className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" placeholder="Brand name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" placeholder="brand-slug" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
              <input className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" placeholder="Logo URL" value={form.logoUrl} onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))} />
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Brand"}</Button>
              <textarea className="min-h-24 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary md:col-span-4" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </form>

            <div className="overflow-hidden rounded-[32px] border border-accent/20 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/10">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-gray-400">Loading brands...</td></tr>
                  ) : brands.map((brand) => (
                    <tr key={brand.id}>
                      <td className="px-6 py-5 font-black text-secondary">{brand.name}</td>
                      <td className="px-6 py-5 font-mono text-xs text-gray-400">/{brand.slug}</td>
                      <td className="px-6 py-5 font-bold text-gray-500">{brand.productCount || 0}</td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => deleteBrand(brand.id)} className="text-xs font-black uppercase tracking-widest text-red-500">Delete</button>
                      </td>
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
