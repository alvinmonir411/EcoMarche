"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { categoryApi, subCategoryApi } from "@/services/api";

export default function AdminSubcategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [form, setForm] = useState({ categoryId: "", name: "", slug: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [categoryRes, subCategoryRes] = await Promise.all([
      categoryApi.getAll(),
      subCategoryApi.getAll(),
    ]);

    const nextCategories = categoryRes.success && Array.isArray(categoryRes.data) ? categoryRes.data : [];
    setCategories(nextCategories);
    setSubcategories(subCategoryRes.success && Array.isArray(subCategoryRes.data) ? subCategoryRes.data : []);
    setForm((prev) => ({ ...prev, categoryId: prev.categoryId || nextCategories[0]?.id || "" }));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createSubcategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const res = await subCategoryApi.create(form);
    setSaving(false);

    if (res.success) {
      setForm((prev) => ({ categoryId: prev.categoryId, name: "", slug: "", description: "" }));
      await loadData();
    } else {
      alert(res.error || "Failed to save subcategory");
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    const res = await subCategoryApi.delete(id);
    if (res.success) setSubcategories((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-accent/5 py-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <AdminSidebar />
          <main className="flex-1">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-secondary">Subcategories</h1>
              <p className="mt-2 text-sm font-bold text-gray-500">Manage nested category groups for cleaner product filters.</p>
            </header>

            <form onSubmit={createSubcategory} className="mb-8 grid gap-4 rounded-[32px] border border-accent/20 bg-white p-6 shadow-sm md:grid-cols-4">
              <select className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <input className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" placeholder="Subcategory name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" placeholder="subcategory-slug" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Subcategory"}</Button>
              <textarea className="min-h-20 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary md:col-span-4" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </form>

            <div className="overflow-hidden rounded-[32px] border border-accent/20 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Subcategory</th>
                    <th className="px-6 py-4">Parent</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/10">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-gray-400">Loading subcategories...</td></tr>
                  ) : subcategories.map((subcategory) => (
                    <tr key={subcategory.id}>
                      <td className="px-6 py-5">
                        <span className="block font-black text-secondary">{subcategory.name}</span>
                        <span className="font-mono text-xs text-gray-400">/{subcategory.slug}</span>
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-500">{subcategory.category?.name || "Unassigned"}</td>
                      <td className="px-6 py-5 font-bold text-gray-500">{subcategory.productCount || 0}</td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => deleteSubcategory(subcategory.id)} className="text-xs font-black uppercase tracking-widest text-red-500">Delete</button>
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
