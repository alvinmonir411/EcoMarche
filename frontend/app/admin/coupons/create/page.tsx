import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function AdminCouponCreatePage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:p-12">
        <div className="mb-10">
          <Link href="/admin/coupons" className="text-sm text-primary hover:underline mb-4 block">← Back to Coupons</Link>
          <h1 className="text-3xl font-bold text-secondary">Create New Coupon</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
          <form className="space-y-6">
            <Input label="Coupon Code" placeholder="e.g. SUMMER50" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Discount Amount" placeholder="10" />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full px-4 py-2 border rounded-md outline-none">
                  <option>Percentage (%)</option>
                  <option>Fixed Amount ($)</option>
                </select>
              </div>
            </div>
            <Input label="Expiry Date" type="date" />
            <div className="flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Create Coupon</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
