"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { categoryApi } from "@/services/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      if (res.success) {
        const data = res.data;
        setCategories(Array.isArray(data) ? data : (data?.categories || data?.data || []));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await categoryApi.delete(id);
      if (res.success) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert(res.error || "Failed to delete category");
      }
    } catch (error) {
      alert("An error occurred while deleting category");
    }
  };

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />
          
          <main className="flex-1">
            <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-secondary mb-2">Categories</h1>
                <p className="text-gray-500">Organize your products into logical groups.</p>
              </div>
              <Link href="/admin/categories/create">
                <Button size="lg" className="shadow-lg shadow-primary/20">+ Add Category</Button>
              </Link>
            </header>

            <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Category Name</th>
                      <th className="px-8 py-5">Slug</th>
                      <th className="px-8 py-5">Product Count</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {loading ? (
                       <tr><td colSpan={4} className="px-8 py-10 text-center animate-pulse">Loading categories...</td></tr>
                    ) : Array.isArray(categories) && categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-8 py-6">
                           <span className="font-bold text-secondary group-hover:text-primary transition-colors">{cat.name}</span>
                        </td>
                        <td className="px-8 py-6 text-gray-400 font-mono text-xs">/{cat.slug}</td>
                        <td className="px-8 py-6">
                           <span className="font-bold text-secondary">{cat.products?.length || 0}</span>
                           <span className="text-[10px] text-gray-400 ml-1 font-bold tracking-widest uppercase">Products</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <Link href={`/admin/categories/edit/${cat.id}`} className="p-2 bg-accent/10 rounded-lg text-gray-500 hover:bg-primary hover:text-white transition-all">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Link>
                            <button 
                              onClick={() => handleDelete(cat.id)}
                              className="p-2 bg-accent/10 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && (!Array.isArray(categories) || categories.length === 0) && (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest">No categories found</td></tr>
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
