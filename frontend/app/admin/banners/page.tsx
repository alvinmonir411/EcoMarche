"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { homepageBannersApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal or inline form states for creating/editing
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  
  // Form fields
  const [formType, setFormType] = useState<"hero_slide" | "promo_banner" | "middle_banner">("hero_slide");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formLink, setFormLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await homepageBannersApi.getAll({ admin: "true" });
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.banners || res.data?.data || []);
        setBanners(data);
      } else {
        setError(res.error ? (Array.isArray(res.error) ? res.error.join(', ') : res.error) : "Failed to load homepage banners.");
      }
    } catch (err) {
      setError("An error occurred while fetching banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEditClick = (banner: any) => {
    setEditingBanner(banner);
    setFormType(banner.type);
    setFormTitle(banner.title);
    setFormSubtitle(banner.subtitle || "");
    setFormImageUrl(banner.imageUrl);
    setFormLink(banner.link || "");
    setShowAddForm(false);
    
    // Scroll to form
    const formEl = document.getElementById("banner-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    setEditingBanner(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormImageUrl("");
    setFormLink("");
    setShowAddForm(false);
  };

  const handleAddNewClick = () => {
    setEditingBanner(null);
    setFormType("hero_slide");
    setFormTitle("");
    setFormSubtitle("");
    setFormImageUrl("");
    setFormLink("");
    setShowAddForm(true);

    const formEl = document.getElementById("banner-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImageUrl.trim()) {
      alert("Title and Image URL are required");
      return;
    }

    setIsSaving(true);
    const payload = {
      type: formType,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      imageUrl: formImageUrl.trim(),
      link: formLink.trim(),
    };

    try {
      if (editingBanner) {
        // Update
        const res = await homepageBannersApi.update(editingBanner.id, payload);
        if (res.success) {
          alert("Banner updated successfully!");
          handleCancel();
          await fetchBanners();
        } else {
          alert(res.error || "Failed to update banner");
        }
      } else {
        // Create
        const res = await homepageBannersApi.create(payload);
        if (res.success) {
          alert("Banner created successfully!");
          handleCancel();
          await fetchBanners();
        } else {
          alert(res.error || "Failed to create banner");
        }
      }
    } catch (err) {
      alert("An error occurred while saving the banner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner/slide?")) return;
    try {
      const res = await homepageBannersApi.delete(id);
      if (res.success) {
        setBanners(prev => prev.filter(b => b.id !== id));
        if (editingBanner?.id === id) {
          handleCancel();
        }
      } else {
        alert(res.error || "Failed to delete banner");
      }
    } catch (err) {
      alert("Error deleting banner");
    }
  };

  const handleToggle = async (banner: any) => {
    try {
      const res = await homepageBannersApi.update(banner.id, { enabled: !banner.enabled });
      if (res.success) {
        setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, enabled: !b.enabled } : b));
        if (editingBanner?.id === banner.id) {
          setEditingBanner((prev: any) => ({ ...prev, enabled: !prev.enabled }));
        }
      } else {
        alert(res.error || "Failed to toggle status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleReorder = async (type: string, index: number, direction: 'up' | 'down') => {
    const typeBanners = banners.filter(b => b.type === type);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= typeBanners.length) return;

    // Swap
    const temp = typeBanners[index];
    typeBanners[index] = typeBanners[targetIndex];
    typeBanners[targetIndex] = temp;

    // Build overall new array
    const otherBanners = banners.filter(b => b.type !== type);
    const reorderedTypeBanners = typeBanners.map((b, idx) => ({ ...b, displayOrder: idx + 1 }));
    const newBanners = [...otherBanners, ...reorderedTypeBanners];
    
    setBanners(newBanners);

    try {
      await homepageBannersApi.reorder(reorderedTypeBanners.map(b => b.id));
    } catch (err) {
      console.error("Failed to save reorder", err);
    }
  };

  const heroSlides = banners.filter(b => b.type === "hero_slide");
  const promoBanners = banners.filter(b => b.type === "promo_banner");
  const middleBanners = banners.filter(b => b.type === "middle_banner");

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />

          <main className="flex-1">
            <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold text-secondary mb-2">Homepage Banners</h1>
                <p className="text-gray-500">Manage slideshows, promo grids, and highlight sections dynamically.</p>
              </div>
              <Button onClick={handleAddNewClick} size="lg" className="shadow-lg shadow-primary/20">
                + Add Hero Slide
              </Button>
            </header>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold">
                {error}
              </div>
            )}

            {/* Banner Edit/Create Form (Inline) */}
            {(editingBanner || showAddForm) && (
              <div id="banner-form" className="bg-white rounded-[32px] p-8 mb-12 border border-accent/20 shadow-md">
                <h2 className="text-2xl font-bold text-secondary mb-6">
                  {editingBanner ? `Edit Homepage Banner` : `Add New Hero Slide`}
                </h2>
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Banner Type</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        disabled={!!editingBanner} // Can't change type on edit
                        className="w-full px-5 py-3 rounded-2xl border border-accent/30 focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium disabled:opacity-50"
                      >
                        <option value="hero_slide">Hero Slideshow Slide</option>
                        <option value="promo_banner">Promo Card (2 per row)</option>
                        <option value="middle_banner">Middle Large Feature Banner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Title</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Summer Tailoring, Minimal Silhouettes..."
                        className="w-full px-5 py-3 rounded-2xl border border-accent/30 focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                        {formType === "hero_slide" ? "Subtitle / Description" : "Eyebrow Label"}
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="e.g. Curated luxury tailoring, New Arrivals..."
                        className="w-full px-5 py-3 rounded-2xl border border-accent/30 focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Target Link / URL</label>
                      <input
                        type="text"
                        value={formLink}
                        onChange={(e) => setFormLink(e.target.value)}
                        placeholder="e.g. /shop, /shop?category=winter-wear"
                        className="w-full px-5 py-3 rounded-2xl border border-accent/30 focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Image URL (Unsplash or Static Link)</label>
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/photo-..."
                        className="w-full px-5 py-3 rounded-2xl border border-accent/30 focus:outline-none focus:border-primary text-sm bg-accent/5 font-medium"
                      />
                    </div>
                  </div>

                  {formImageUrl && (
                    <div className="mt-4">
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Preview</p>
                      <div className="relative h-48 w-full max-w-xl overflow-hidden rounded-2xl border border-accent/20">
                        <Image
                          src={getImageUrl(formImageUrl)}
                          alt="Banner Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t border-accent/10">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : editingBanner ? "Update Banner" : "Create Slide"}
                    </Button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-200 rounded-2xl text-secondary hover:bg-gray-50 transition-colors font-bold text-sm uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && banners.length === 0 ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* 1. Hero Slideshow Section */}
                <section className="bg-white rounded-[32px] p-8 border border-accent/20 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-secondary">Hero Slideshow</h2>
                      <p className="text-sm text-gray-400">Large slideshow banners on top of the home page.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {heroSlides.length === 0 ? (
                      <p className="text-gray-400 font-bold text-center py-6 uppercase tracking-wider text-xs">No hero slides found</p>
                    ) : (
                      heroSlides.map((banner, index) => (
                        <div key={banner.id} className={`p-4 rounded-2xl border border-accent/10 flex flex-col md:flex-row gap-4 items-center justify-between transition-opacity ${banner.enabled ? 'opacity-100' : 'opacity-60 bg-gray-50'}`}>
                          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0 flex-1">
                            <div className="relative h-20 w-32 overflow-hidden rounded-xl bg-accent/10 flex-shrink-0">
                              <Image src={getImageUrl(banner.imageUrl)} alt={banner.title} fill className="object-cover" />
                            </div>
                            <div className="min-w-0 text-center sm:text-left">
                              <span className="text-[9px] font-black tracking-widest text-primary uppercase">Slide {index + 1}</span>
                              <h3 className="font-bold text-sm text-secondary truncate">{banner.title}</h3>
                              <p className="text-xs text-gray-400 truncate max-w-md">{banner.subtitle}</p>
                              <p className="text-[10px] text-gray-300 font-bold font-mono">Link: {banner.link || 'None'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Reordering */}
                            <button
                              disabled={index === 0}
                              onClick={() => handleReorder("hero_slide", index, 'up')}
                              className="p-2 bg-accent/5 rounded-lg text-gray-400 hover:bg-accent/10 disabled:opacity-30"
                              title="Move Up"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button
                              disabled={index === heroSlides.length - 1}
                              onClick={() => handleReorder("hero_slide", index, 'down')}
                              className="p-2 bg-accent/5 rounded-lg text-gray-400 hover:bg-accent/10 disabled:opacity-30"
                              title="Move Down"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Enable/Disable status */}
                            <button
                              onClick={() => handleToggle(banner)}
                              className={`p-2 rounded-lg transition-colors ${banner.enabled ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              title={banner.enabled ? "Disable slide" : "Enable slide"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(banner)}
                              className="p-2 bg-accent/5 rounded-lg text-secondary hover:bg-primary hover:text-white transition-all"
                              title="Edit slide"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(banner.id)}
                              className="p-2 bg-accent/5 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              title="Delete slide"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* 2. Side Promo Cards Section */}
                <section className="bg-white rounded-[32px] p-8 border border-accent/20 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-secondary">Promotional Sidebar Cards</h2>
                    <p className="text-sm text-gray-400 mb-6">The two column banners positioned next to the hero slideshow.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {promoBanners.map((banner, index) => (
                      <div key={banner.id} className={`p-4 rounded-2xl border border-accent/10 flex flex-col justify-between h-72 relative overflow-hidden transition-opacity ${banner.enabled ? 'opacity-100' : 'opacity-60 bg-gray-50'}`}>
                        <div className="absolute inset-0 z-0">
                          <Image src={getImageUrl(banner.imageUrl)} alt={banner.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/50" />
                        </div>
                        
                        <div className="relative z-10 text-white flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                              Promo Card {index + 1}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleToggle(banner)}
                                className={`p-1.5 rounded-lg transition-colors ${banner.enabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button
                                onClick={() => handleEditClick(banner)}
                                className="p-1.5 bg-white/20 text-white hover:bg-primary hover:text-white rounded-lg transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">{banner.subtitle}</span>
                            <h3 className="text-lg font-black leading-tight mb-1">{banner.title}</h3>
                            <p className="text-[9px] font-bold text-gray-300 font-mono">Link: {banner.link || 'None'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Middle Highlight Banner Section */}
                <section className="bg-white rounded-[32px] p-8 border border-accent/20 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-secondary">Middle Feature Banner</h2>
                    <p className="text-sm text-gray-400 mb-6">Large, full-width feature banner displayed above the collection categories.</p>
                  </div>

                  {middleBanners.map((banner) => (
                    <div key={banner.id} className={`p-6 rounded-2xl border border-accent/10 flex flex-col justify-between h-56 relative overflow-hidden transition-opacity ${banner.enabled ? 'opacity-100' : 'opacity-60 bg-gray-50'}`}>
                      <div className="absolute inset-0 z-0">
                        <Image src={getImageUrl(banner.imageUrl)} alt={banner.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/45" />
                      </div>
                      
                      <div className="relative z-10 text-white flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                            Middle Banner
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleToggle(banner)}
                              className={`p-1.5 rounded-lg transition-colors ${banner.enabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button
                              onClick={() => handleEditClick(banner)}
                              className="p-1.5 bg-white/20 text-white hover:bg-primary hover:text-white rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          </div>
                        </div>

                        <div className="text-center mx-auto">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/70 block mb-1">{banner.subtitle}</span>
                          <h3 className="text-2xl font-black leading-tight mb-2">{banner.title}</h3>
                          <p className="text-[10px] text-gray-300 font-bold font-mono">Link: {banner.link || 'None'}</p>
                        </div>
                        
                        <div></div> {/* Spacer */}
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
