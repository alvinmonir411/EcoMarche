"use client";

import { useState, useEffect, useRef } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { productApi, categoryApi } from "@/services/api";
import { useRouter } from "next/navigation";

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    size: "S, M, L, XL",
    color: "Black",
    categoryId: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await categoryApi.getAll();
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
        }
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name if slug is manually unchanged
    if (name === "name" && !formData.slug) {
      setFormData((prev) => ({ ...prev, name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailFile) {
      alert("Please select a thumbnail image.");
      return;
    }

    setLoading(true);
    try {
      setUploading(true);
      // 1. Upload thumbnail
      const thumbnailUrl = await uploadFileToCloudinary(thumbnailFile);
      
      // 2. Upload gallery images
      const imageUrls = [];
      for (const file of galleryFiles) {
        const url = await uploadFileToCloudinary(file);
        imageUrls.push(url);
      }
      setUploading(false);

      // 3. Create product
      const productPayload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock),
        size: formData.size,
        color: formData.color,
        categoryId: formData.categoryId,
        thumbnail: thumbnailUrl,
        imageUrls: imageUrls,
      };

      const res = await productApi.create(productPayload);
      if (res.success) {
        alert("Product created successfully!");
        router.push("/admin/products");
      } else {
        alert(res.error || "Failed to create product");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />
          
          <main className="flex-1">
            <header className="mb-12">
              <Link href="/admin/products" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all mb-4 block">← Back to Inventory</Link>
              <h1 className="text-4xl font-bold text-secondary mb-2">Add New Product</h1>
              <p className="text-gray-500">Enter the details of the new item to add it to the catalog.</p>
            </header>

            <form className="space-y-12" onSubmit={handleSubmit}>
              {/* General Information */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Product Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Silk Evening Dress" />
                  <Input label="Slug" name="slug" value={formData.slug} onChange={handleInputChange} required placeholder="e.g. silk-evening-dress" />
                  
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all">
                      {categories.map(cat => (
                         <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Input label="Regular Price ($)" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required placeholder="150.00" />
                  <Input label="Discount Price ($)" name="discountPrice" type="number" step="0.01" value={formData.discountPrice} onChange={handleInputChange} placeholder="120.00" />
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[150px]"
                      placeholder="Enter a detailed description of the product..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Inventory & Attributes */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">Inventory & Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Initial Stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required placeholder="50" />
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</label>
                    <select className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all">
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Hidden</option>
                    </select>
                  </div>
                  <Input label="Available Sizes (comma separated)" name="size" value={formData.size} onChange={handleInputChange} required placeholder="S, M, L" />
                  <Input label="Available Colors (comma separated)" name="color" value={formData.color} onChange={handleInputChange} required placeholder="Black, White" />
                </div>
              </div>

              {/* Media */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Thumbnail Upload */}
                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Thumbnail Image (Required)</label>
                     <div onClick={() => thumbnailInputRef.current?.click()} className="h-48 border-2 border-dashed border-accent/20 rounded-[32px] p-6 flex flex-col items-center justify-center bg-accent/5 hover:bg-white hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                       <input type="file" accept="image/*" className="hidden" ref={thumbnailInputRef} onChange={(e) => { if(e.target.files?.[0]) setThumbnailFile(e.target.files[0]) }} />
                       {thumbnailFile ? (
                         <img src={URL.createObjectURL(thumbnailFile)} alt="Thumbnail" className="absolute inset-0 w-full h-full object-contain bg-white" />
                       ) : (
                         <>
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-all mb-3 shadow-sm">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                           </div>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary text-center">Click to Upload<br/>Thumbnail</span>
                         </>
                       )}
                     </div>
                  </div>

                  {/* Gallery Upload */}
                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Gallery Images (Optional)</label>
                     <div onClick={() => galleryInputRef.current?.click()} className="h-48 border-2 border-dashed border-accent/20 rounded-[32px] p-6 flex flex-col items-center justify-center bg-accent/5 hover:bg-white hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                       <input type="file" accept="image/*" multiple className="hidden" ref={galleryInputRef} onChange={(e) => { if(e.target.files) setGalleryFiles(Array.from(e.target.files)) }} />
                       {galleryFiles.length > 0 ? (
                         <div className="absolute inset-0 bg-white grid grid-cols-2 gap-2 p-2 overflow-y-auto">
                            {galleryFiles.map((file, i) => (
                               <img key={i} src={URL.createObjectURL(file)} alt="Gallery" className="w-full h-20 object-cover rounded-xl border border-gray-100" />
                            ))}
                         </div>
                       ) : (
                         <>
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-all mb-3 shadow-sm">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           </div>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary text-center">Click to Upload<br/>Multiple Images</span>
                         </>
                       )}
                     </div>
                  </div>

                </div>
              </div>

              <div className="flex justify-end gap-6">
                <Link href="/admin/products">
                  <Button variant="outline" size="lg" className="px-12" type="button" disabled={loading}>Cancel</Button>
                </Link>
                <Button size="lg" className="px-12 shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                  {loading ? (uploading ? "Uploading Images..." : "Saving Product...") : "Create Product"}
                </Button>
              </div>
            </form>
          </main>
        </div>
      </Container>
    </div>
  );
}
