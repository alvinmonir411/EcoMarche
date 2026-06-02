"use client";

import { useCallback, useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { homepageSectionsApi, productApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New section form
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Rename form
  const [renameTitle, setRenameTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Product search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchSections = async (selectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await homepageSectionsApi.getAll({ admin: "true" });
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.sections || res.data?.data || []);
        // Sort by displayOrder just in case
        const sorted = [...data].sort((a: any, b: any) => a.displayOrder - b.displayOrder);
        setSections(sorted);

        // Maintain selection or select first
        if (sorted.length > 0) {
          const toSelect = selectId 
            ? sorted.find(s => s.id === selectId) || sorted[0]
            : sorted[0];
          setSelectedSection(toSelect);
          setRenameTitle(toSelect.title);
        } else {
          setSelectedSection(null);
        }
      } else {
        setError(res.error ? (Array.isArray(res.error) ? res.error.join(', ') : res.error) : "Failed to load homepage sections.");
      }
    } catch (err) {
      setError("An error occurred while fetching homepage sections.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = (sec: any) => {
    setSelectedSection(sec);
    setRenameTitle(sec.title);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const searchProducts = useCallback(async () => {
    setSearching(true);
    try {
      const res = await productApi.getAll({ search: searchQuery, limit: 10 });
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || res.data?.data || []);
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // Search products
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchProducts();
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchProducts, searchQuery]);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await homepageSectionsApi.create({ title: newTitle.trim(), enabled: true });
      if (res.success) {
        setNewTitle("");
        await fetchSections(res.data?.id);
      } else {
        alert(res.error || "Failed to create section");
      }
    } catch (err) {
      alert("Error creating section");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim() || !selectedSection) return;
    setIsRenaming(true);
    try {
      const res = await homepageSectionsApi.update(selectedSection.id, { title: renameTitle.trim() });
      if (res.success) {
        await fetchSections(selectedSection.id);
      } else {
        alert(res.error || "Failed to rename section");
      }
    } catch (err) {
      alert("Error renaming section");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleToggleSection = async (sec: any) => {
    try {
      const res = await homepageSectionsApi.update(sec.id, { enabled: !sec.enabled });
      if (res.success) {
        // Update local state smoothly
        setSections(prev => prev.map(s => s.id === sec.id ? { ...s, enabled: !s.enabled } : s));
        if (selectedSection?.id === sec.id) {
          setSelectedSection((prev: any) => ({ ...prev, enabled: !prev.enabled }));
        }
      } else {
        alert(res.error || "Failed to toggle section status");
      }
    } catch (err) {
      alert("Error toggling section status");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this section? All product mappings inside it will be removed.")) return;
    try {
      const res = await homepageSectionsApi.delete(id);
      if (res.success) {
        await fetchSections();
      } else {
        alert(res.error || "Failed to delete section");
      }
    } catch (err) {
      alert("Error deleting section");
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update display orders locally
    const updatedSections = newSections.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setSections(updatedSections);

    try {
      const sectionIds = updatedSections.map(s => s.id);
      await homepageSectionsApi.reorder(sectionIds);
    } catch (err) {
      console.error("Failed to save section reorder:", err);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!selectedSection) return;
    const currentProducts = selectedSection.sectionProducts || [];
    const newProductIds = currentProducts
      .map((sp: any) => sp.product?.id)
      .filter((id: string) => id !== productId);

    try {
      const res = await homepageSectionsApi.assignProducts(selectedSection.id, newProductIds);
      if (res.success) {
        // Refresh this section's details
        setSelectedSection(res.data);
        setSections(prev => prev.map(s => s.id === selectedSection.id ? res.data : s));
      } else {
        alert(res.error || "Failed to remove product");
      }
    } catch (err) {
      alert("Error removing product");
    }
  };

  const handleAddProduct = async (product: any) => {
    if (!selectedSection) return;
    const currentProducts = selectedSection.sectionProducts || [];
    
    // Check if product already exists in section
    if (currentProducts.some((sp: any) => sp.product?.id === product.id)) {
      alert("Product is already in this section");
      return;
    }

    const newProductIds = [...currentProducts.map((sp: any) => sp.product?.id), product.id];

    try {
      const res = await homepageSectionsApi.assignProducts(selectedSection.id, newProductIds);
      if (res.success) {
        // Refresh this section's details
        setSelectedSection(res.data);
        setSections(prev => prev.map(s => s.id === selectedSection.id ? res.data : s));
      } else {
        alert(res.error || "Failed to add product");
      }
    } catch (err) {
      alert("Error adding product");
    }
  };

  const handleProductReorder = async (index: number, direction: 'up' | 'down') => {
    if (!selectedSection) return;
    const items = [...(selectedSection.sectionProducts || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const newProductIds = items.map((sp: any) => sp.product?.id);

    try {
      const res = await homepageSectionsApi.assignProducts(selectedSection.id, newProductIds);
      if (res.success) {
        setSelectedSection(res.data);
        setSections(prev => prev.map(s => s.id === selectedSection.id ? res.data : s));
      }
    } catch (err) {
      console.error("Failed to reorder products inside section:", err);
    }
  };

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />

          <main className="flex-1">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold text-secondary mb-2">Homepage Sections</h1>
                <p className="text-gray-500">Manage order, display status, and products in public homepage collections.</p>
              </div>
            </header>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold">
                {error}
              </div>
            )}

            {/* Create Section Form */}
            <div className="bg-white rounded-[32px] p-6 mb-8 border border-accent/20 shadow-sm">
              <h2 className="text-lg font-bold text-secondary mb-4">Create New Section</h2>
              <form onSubmit={handleCreateSection} className="flex gap-4">
                <input
                  type="text"
                  placeholder="e.g. Winter Clothes, Eid Special Collection..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-2xl border border-accent/30 focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium"
                />
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "+ Add Section"}
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sections List */}
              <div className="lg:col-span-5 bg-white rounded-[32px] p-6 border border-accent/20 shadow-sm flex flex-col h-[650px]">
                <h2 className="text-lg font-bold text-secondary mb-4">Active Sections</h2>
                
                {loading && sections.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 font-bold text-center py-10 uppercase tracking-widest text-xs">
                    No sections found
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {sections.map((sec, idx) => {
                      const isSelected = selectedSection?.id === sec.id;
                      return (
                        <div
                          key={sec.id}
                          onClick={() => handleSelectSection(sec)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/15"
                              : "bg-accent/5 border-transparent text-secondary hover:bg-accent/10"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <h3 className="font-bold text-sm truncate">{sec.title}</h3>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                              {sec.sectionProducts?.length || 0} Products • {sec.enabled ? "Active" : "Hidden"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Reorder Buttons */}
                            <button
                              disabled={idx === 0}
                              onClick={() => handleReorder(idx, 'up')}
                              className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'hover:bg-white/20 text-white disabled:opacity-30' : 'hover:bg-accent/15 text-gray-400 disabled:opacity-30'}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button
                              disabled={idx === sections.length - 1}
                              onClick={() => handleReorder(idx, 'down')}
                              className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'hover:bg-white/20 text-white disabled:opacity-30' : 'hover:bg-accent/15 text-gray-400 disabled:opacity-30'}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Status Toggle */}
                            <button
                              onClick={() => handleToggleSection(sec)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                sec.enabled
                                  ? isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
                                  : isSelected ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title={sec.enabled ? "Disable section" : "Enable section"}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'hover:bg-red-500 text-red-300' : 'hover:bg-red-50 text-red-500'}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Section Products & Management */}
              <div className="lg:col-span-7 bg-white rounded-[32px] p-6 border border-accent/20 shadow-sm flex flex-col h-[650px]">
                {selectedSection ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Rename Header */}
                    <div className="border-b border-accent/10 pb-4 mb-4">
                      <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Section Settings</h2>
                      <form onSubmit={handleRenameSection} className="flex gap-3">
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          className="flex-1 px-4 py-2 border border-accent/30 rounded-xl focus:outline-none focus:border-primary text-sm font-medium bg-accent/5"
                        />
                        <Button type="submit" size="sm" disabled={isRenaming}>
                          {isRenaming ? "Saving..." : "Save Title"}
                        </Button>
                      </form>
                    </div>

                    {/* Section Products */}
                    <div className="flex-1 flex flex-col min-h-0 mb-4">
                      <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">
                        Assigned Products ({selectedSection.sectionProducts?.length || 0})
                      </h2>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 bg-accent/5 rounded-2xl p-3 border border-accent/15">
                        {(!selectedSection.sectionProducts || selectedSection.sectionProducts.length === 0) ? (
                          <div className="h-full flex items-center justify-center text-center text-gray-400 text-xs font-bold uppercase tracking-wider py-8">
                            No products assigned yet. Search below to add!
                          </div>
                        ) : (
                          selectedSection.sectionProducts.map((sp: any, idx: number) => {
                            if (!sp.product) return null;
                            const imageSrc = sp.product.imageUrl || sp.product.thumbnail || getProductFallbackImage(sp.product.slug || sp.product.id);
                            return (
                              <div key={sp.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-accent/10 shadow-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-accent/10">
                                    <Image
                                      src={getImageUrl(imageSrc)}
                                      alt={sp.product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-xs text-secondary truncate">{sp.product.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold font-mono">${sp.product.price}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Product reorder */}
                                  <button
                                    disabled={idx === 0}
                                    onClick={() => handleProductReorder(idx, 'up')}
                                    className="p-1 rounded-lg hover:bg-accent/10 text-gray-400 disabled:opacity-30"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
                                  </button>
                                  <button
                                    disabled={idx === (selectedSection.sectionProducts?.length - 1)}
                                    onClick={() => handleProductReorder(idx, 'down')}
                                    className="p-1 rounded-lg hover:bg-accent/10 text-gray-400 disabled:opacity-30"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                  {/* Remove button */}
                                  <button
                                    onClick={() => handleRemoveProduct(sp.product.id)}
                                    className="ml-2 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Search & Add Products */}
                    <div className="h-[210px] flex flex-col min-h-0 border-t border-accent/10 pt-4">
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Search products to add..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-accent/30 rounded-xl focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium"
                        />
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-1.5 bg-accent/5 rounded-xl p-2 pr-1">
                        {searching ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : searchQuery.trim() === "" ? (
                          <div className="h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Type 2+ letters to search products
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            No products matched your search
                          </div>
                        ) : (
                          searchResults.map((product) => {
                            const isAssigned = selectedSection.sectionProducts?.some((sp: any) => sp.product?.id === product.id);
                            return (
                              <div key={product.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-accent/10 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="relative h-7 w-7 overflow-hidden rounded-md bg-accent/10">
                                    <Image
                                      src={getImageUrl(product.imageUrl || product.thumbnail || getProductFallbackImage(product.slug || product.id))}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="font-bold text-xs text-secondary truncate">{product.name}</span>
                                </div>
                                <button
                                  onClick={() => handleAddProduct(product)}
                                  disabled={isAssigned}
                                  className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                                    isAssigned
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                  }`}
                                >
                                  {isAssigned ? "Added" : "+ Add"}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                    Create or select a section to manage products
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
