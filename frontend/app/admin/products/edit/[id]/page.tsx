"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { productApi, categoryApi } from "@/services/api";
import { getImageUrl } from "@/utils/image";
import { ECOMARCHE_PLACEHOLDER } from "@/utils/fashionImages";

interface GalleryItem {
  type: 'existing' | 'new';
  url?: string;
  file?: File;
  previewUrl?: string;
  id: string;
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    size: "",
    color: "",
    categoryId: "",
    featured: false,
    flashSale: false,
    newArrival: false,
    trending: false,
    bestSelling: false,
    justForYou: false,
    active: true,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch categories
        const catRes = await categoryApi.getAll();
        const availableCategories = catRes.success && catRes.data ? catRes.data : [];
        setCategories(availableCategories);

        // 2. Fetch product
        const prodRes = await productApi.getById(id);
        if (prodRes.success && prodRes.data) {
          const product = prodRes.data;
          setFormData({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            discountPrice: product.discountPrice?.toString() || "",
            stock: product.stock?.toString() || "0",
            size: Array.isArray(product.sizes) ? product.sizes.join(", ") : (product.size || ""),
            color: Array.isArray(product.colors) ? product.colors.join(", ") : (product.color || ""),
            categoryId: product.category?.id || (availableCategories[0]?.id || ""),
            featured: !!product.featured,
            flashSale: !!product.flashSale,
            newArrival: !!product.newArrival,
            trending: !!product.trending,
            bestSelling: !!product.bestSelling,
            justForYou: !!product.justForYou,
            active: product.active !== false,
          });

          setThumbnailUrl(product.thumbnail || "");
          
          const initialGallery = (product.images || []).map((img: any) => ({
            type: 'existing' as const,
            url: img.imageUrl,
            id: img.id?.toString() || Math.random().toString(),
          }));
          setGalleryItems(initialGallery);
        } else {
          alert("Failed to load product details.");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error loading product edit data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to upload image");
    }
    return result.url;
  };

  const handleRemoveGalleryItem = (itemId: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailFile && !thumbnailUrl) {
      alert("Please upload a thumbnail image.");
      return;
    }

    setSaving(true);
    try {
      setUploading(true);

      // 1. Upload new thumbnail if selected
      let finalThumbnail = thumbnailUrl;
      if (thumbnailFile) {
        finalThumbnail = await uploadFileToCloudinary(thumbnailFile);
      }

      // 2. Upload new gallery images and combine with existing ones
      const finalImageUrls: string[] = [];
      for (const item of galleryItems) {
        if (item.type === 'existing' && item.url) {
          finalImageUrls.push(item.url);
        } else if (item.type === 'new' && item.file) {
          const uploadedUrl = await uploadFileToCloudinary(item.file);
          finalImageUrls.push(uploadedUrl);
        }
      }
      setUploading(false);

      // 3. Construct update payload
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        sizes: formData.size.split(",").map((s) => s.trim()).filter(Boolean),
        colors: formData.color.split(",").map((c) => c.trim()).filter(Boolean),
        categoryId: formData.categoryId,
        thumbnail: finalThumbnail,
        imageUrls: finalImageUrls,
        featured: formData.featured,
        flashSale: formData.flashSale,
        newArrival: formData.newArrival,
        trending: formData.trending,
        bestSelling: formData.bestSelling,
        justForYou: formData.justForYou,
        active: formData.active,
      };

      const res = await productApi.update(id, payload);
      if (res.success) {
        alert("Product updated successfully!");
        router.push("/admin/products");
      } else {
        alert(res.error || "Failed to update product");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred");
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 bg-accent/5 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeThumbnailSrc = thumbnailFile 
    ? URL.createObjectURL(thumbnailFile) 
    : getImageUrl(thumbnailUrl);

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />
          
          <main className="flex-1">
            <header className="mb-12">
              <Link href="/admin/products" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all mb-4 block">← Back to Inventory</Link>
              <h1 className="text-4xl font-bold text-secondary mb-2">Edit Product</h1>
              <p className="text-gray-500 font-medium">Update the details of the product to modify it in the catalog.</p>
            </header>

            <form className="space-y-12" onSubmit={handleSubmit}>
              {/* General Information */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Product Name" name="name" value={formData.name} onChange={handleInputChange} required />
                  <Input label="Slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
                  
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select 
                      name="categoryId" 
                      value={formData.categoryId} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Input label="Regular Price ($)" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  <Input label="Discount Price ($)" name="discountPrice" type="number" step="0.01" value={formData.discountPrice} onChange={handleInputChange} />
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[150px]"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Inventory & Attributes */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">Inventory & Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Initial Stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</label>
                    <select 
                      name="active" 
                      value={formData.active ? "true" : "false"} 
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === "true" }))}
                      className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-secondary"
                    >
                      <option value="true">Published</option>
                      <option value="false">Draft / Inactive</option>
                    </select>
                  </div>
                  <Input label="Available Sizes (comma separated)" name="size" value={formData.size} onChange={handleInputChange} required />
                  <Input label="Available Colors (comma separated)" name="color" value={formData.color} onChange={handleInputChange} required />
                  
                  <div className="md:col-span-2 border-t border-accent/10 pt-6 mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Homepage & Listing Flags</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {[
                        { key: "featured", label: "Featured" },
                        { key: "flashSale", label: "Flash Sale" },
                        { key: "newArrival", label: "New Arrival" },
                        { key: "trending", label: "Trending" },
                        { key: "bestSelling", label: "Best Selling" },
                        { key: "justForYou", label: "Just For You" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name={key}
                            checked={!!(formData as any)[key]}
                            onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="w-5 h-5 rounded-md border-accent/30 text-primary focus:ring-primary accent-primary cursor-pointer"
                          />
                          <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Thumbnail Image (Required)</label>
                    {activeThumbnailSrc && activeThumbnailSrc !== getImageUrl("") ? (
                      <div className="relative h-48 border-2 border-accent/20 rounded-[32px] overflow-hidden group bg-white shadow-sm flex items-center justify-center p-2">
                        <img 
                          src={activeThumbnailSrc} 
                          alt="Thumbnail" 
                          className="w-full h-full object-contain" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setThumbnailFile(null);
                            setThumbnailUrl("");
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10"
                          title="Remove thumbnail"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => thumbnailInputRef.current?.click()} 
                        className="h-48 border-2 border-dashed border-accent/20 rounded-[32px] p-6 flex flex-col items-center justify-center bg-accent/5 hover:bg-white hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden"
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={thumbnailInputRef} 
                          onChange={(e) => { if(e.target.files?.[0]) setThumbnailFile(e.target.files[0]) }} 
                        />
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-all mb-3 shadow-sm">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary text-center">Click to Upload<br/>Thumbnail</span>
                      </div>
                    )}
                  </div>

                  {/* Gallery Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Gallery Images (Optional)</label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Upload Trigger Card */}
                      <div 
                        onClick={() => galleryInputRef.current?.click()} 
                        className="h-48 border-2 border-dashed border-accent/20 rounded-[32px] p-4 flex flex-col items-center justify-center bg-accent/5 hover:bg-white hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden"
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          ref={galleryInputRef} 
                          onChange={(e) => { 
                            if(e.target.files) {
                              const newItems = Array.from(e.target.files).map(file => ({
                                type: 'new' as const,
                                file,
                                previewUrl: URL.createObjectURL(file),
                                id: Math.random().toString(),
                              }));
                              setGalleryItems(prev => [...prev, ...newItems]);
                            } 
                          }} 
                        />
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-all mb-2 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary text-center">Add Gallery<br/>Images</span>
                      </div>

                      {/* Preview Container */}
                      <div className="h-48 border border-accent/10 rounded-[32px] p-4 overflow-y-auto bg-accent/5 grid grid-cols-2 gap-2">
                        {galleryItems.length > 0 ? (
                          galleryItems.map((item) => {
                            const imgSrc = item.type === 'existing' 
                              ? getImageUrl(item.url) 
                              : item.previewUrl;
                            return (
                              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group bg-white shadow-sm flex items-center justify-center p-1 border border-gray-100">
                                <img 
                                  src={imgSrc} 
                                  alt="Gallery preview" 
                                  className="w-full h-full object-contain" 
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveGalleryItem(item.id);
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-white/95 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                                  title="Remove image"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 h-full flex items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No gallery images</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex justify-end gap-6">
                <Link href="/admin/products">
                  <Button variant="outline" size="lg" className="px-12" type="button" disabled={saving}>Cancel</Button>
                </Link>
                <Button size="lg" className="px-12 shadow-lg shadow-primary/20" type="submit" disabled={saving}>
                  {saving ? (uploading ? "Uploading Images..." : "Saving Changes...") : "Update Product"}
                </Button>
              </div>
            </form>
          </main>
        </div>
      </Container>
    </div>
  );
}
