import Image from "next/image";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { productFashionImages } from "@/utils/fashionImages";

export default function AdminProductEditPage() {
  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />
          
          <main className="flex-1">
            <header className="mb-12">
              <Link href="/admin/products" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all mb-4 block">← Back to Inventory</Link>
              <h1 className="text-4xl font-bold text-secondary mb-2">Edit Product</h1>
              <p className="text-gray-500">Update the details of the existing product #PRD-1021.</p>
            </header>

            <form className="space-y-12">
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Product Name" defaultValue="Premium Silk Evening Dress" />
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all" defaultValue="Women Dress">
                      <option>Women Dress</option>
                      <option>Men Clothing</option>
                      <option>Kids Dress</option>
                      <option>Saree</option>
                    </select>
                  </div>
                  <Input label="Regular Price ($)" type="number" defaultValue="150.00" />
                  <Input label="Discount Price ($)" type="number" defaultValue="120.00" />
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[150px]"
                      defaultValue="This elegant evening dress is crafted from the finest mulberry silk..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">Inventory & Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Input label="SKU" defaultValue="SKU-SILK-01" />
                  <Input label="Initial Stock" type="number" defaultValue="24" />
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</label>
                    <select className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all" defaultValue="Published">
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
                <h3 className="text-xl font-bold text-secondary mb-8 pb-4 border-b border-accent/10">Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-accent/10 rounded-2xl overflow-hidden relative group">
                      <Image src={productFashionImages[i]} alt={`Product media ${i}`} fill sizes="160px" className="object-cover" />
                      <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed border-accent/20 rounded-2xl flex items-center justify-center bg-accent/5 hover:bg-white hover:border-primary/50 transition-all cursor-pointer group">
                     <svg className="w-8 h-8 text-gray-400 group-hover:text-primary transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6">
                <Link href="/admin/products">
                  <Button variant="outline" size="lg" className="px-12">Cancel</Button>
                </Link>
                <Button size="lg" className="px-12 shadow-lg shadow-primary/20">Update Product</Button>
              </div>
            </form>
          </main>
        </div>
      </Container>
    </div>
  );
}
