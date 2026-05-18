import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function AdminCategoryEditPage() {
  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />
          
          <main className="flex-1">
            <header className="mb-12">
              <Link href="/admin/categories" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all mb-4 block">← Back to Categories</Link>
              <h1 className="text-4xl font-bold text-secondary mb-2">Edit Category</h1>
              <p className="text-gray-500">Update the details for the "Women Dress" category.</p>
            </header>

            <div className="max-w-2xl bg-white p-10 rounded-[32px] shadow-sm border border-accent/20">
              <form className="space-y-8">
                <Input label="Category Name" defaultValue="Women Dress" />
                <Input label="Slug" defaultValue="women-dress" />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description (Optional)</label>
                  <textarea 
                    className="w-full bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[120px]"
                    defaultValue="Our exclusive collection of elegant and casual dresses for women."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-6 pt-4">
                  <Link href="/admin/categories">
                    <Button variant="outline" size="lg" className="px-10">Cancel</Button>
                  </Link>
                  <Button size="lg" className="px-10 shadow-lg shadow-primary/20">Update Category</Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
