"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { productApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ search: searchTerm });
      if (res.success) {
        const prodData = res.data;
        setProducts(Array.isArray(prodData) ? prodData : (prodData?.data || prodData?.products || []));
      }
    } catch (error) {
      console.error("Error fetching admin products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await productApi.delete(id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert(res.error || "Failed to delete product");
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
                <h1 className="text-4xl font-bold text-secondary mb-2">Inventory</h1>
                <p className="text-gray-500">Manage your product catalog and stock levels.</p>
              </div>
              <Link href="/admin/products/create">
                <Button size="lg" className="shadow-lg shadow-primary/20">+ Add New Product</Button>
              </Link>
            </header>

            <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
              <div className="p-8 border-b border-accent/10">
                <div className="relative w-full sm:w-96">
                  <input 
                    type="text" 
                    placeholder="Search by name, SKU or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-accent/5 border border-accent/20 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Product</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5">Price</th>
                      <th className="px-8 py-5">Stock</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {loading ? (
                       <tr><td colSpan={6} className="px-8 py-10 text-center animate-pulse">Loading products...</td></tr>
                    ) : Array.isArray(products) && products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-accent/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 bg-accent/10 rounded-xl overflow-hidden flex-shrink-0">
                                <Image
                                  src={getImageUrl(product.thumbnail || product.imageUrl || getProductFallbackImage(product.slug || product.id || product.name))}
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-secondary group-hover:text-primary transition-colors">{product.name}</span>
                                {product.sku && <span className="text-[11px] text-gray-400 font-medium">SKU: {product.sku}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-gray-500 font-medium">{product.category?.name || 'Uncategorized'}</td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              {product.salePrice ? (
                                <>
                                  <span className="font-bold text-primary">${Number(product.salePrice).toFixed(2)}</span>
                                  <span className="text-xs text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="font-bold text-secondary">${Number(product.price).toFixed(2)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-gray-500'}`}>{product.stock || 0}</span>
                             <span className="text-[10px] text-gray-400 ml-1 font-bold">UNITS</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              product.active && product.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {product.active && product.status === "ACTIVE" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              <Link href={`/admin/products/edit/${product.id}`} className="p-2 bg-accent/10 rounded-lg text-gray-500 hover:bg-primary hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </Link>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-2 bg-accent/10 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest">No products found</td></tr>
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
