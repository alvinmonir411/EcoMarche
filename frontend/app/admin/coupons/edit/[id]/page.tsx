"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { couponApi } from "@/services/api";

export default function AdminCouponEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState<any>(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      setLoading(true);
      const res = await couponApi.getById(id);
      if (res.success && res.data) {
        setCoupon(res.data);
      } else {
        setError((Array.isArray(res.error) ? res.error.join(", ") : res.error) || "Failed to load coupon.");
      }
      setLoading(false);
    };
    if (id) fetchCoupon();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const isActiveVal = formData.get("isActive");

    const data = {
      code: formData.get("code") as string,
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string),
      minOrderAmount: formData.get("minOrderAmount") ? parseFloat(formData.get("minOrderAmount") as string) : 0,
      expiryDate: formData.get("expiryDate") ? new Date(formData.get("expiryDate") as string).toISOString() : null,
      isActive: isActiveVal === "true" || isActiveVal === "on",
    };

    const res = await couponApi.update(id, data);

    if (res.success) {
      router.push("/admin/coupons");
    } else {
      setError((Array.isArray(res.error) ? res.error.join(", ") : res.error) || "Failed to update coupon.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32 bg-stone-50 min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-teal-700"></div>
      </div>
    );
  }

  // Format date for datetime-local input safely
  const formattedDate = coupon?.expiryDate 
    ? new Date(coupon.expiryDate).toISOString().slice(0, 16) 
    : "";

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <div className="bg-white border-b border-stone-200 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Edit Coupon</h1>
            <p className="text-sm text-stone-500 mt-1">Update details for #{coupon?.code}</p>
          </div>
          <Link href="/admin/coupons" className="text-sm font-medium text-stone-500 hover:text-stone-700">
            &larr; Back
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Coupon Code" name="code" required defaultValue={coupon?.code} />
            
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Discount Type</span>
              <select
                name="type"
                defaultValue={coupon?.type}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
            <Input label="Discount Value" name="value" type="number" step="0.01" required defaultValue={coupon?.value} />
            <Input label="Minimum Order Amount ($)" name="minOrderAmount" type="number" step="0.01" defaultValue={coupon?.minOrderAmount || 0} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Expiry Date</span>
              <input
                type="datetime-local"
                name="expiryDate"
                defaultValue={formattedDate}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </label>

            <label className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={coupon?.isActive}
                className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600"
              />
              <span className="text-sm font-medium text-stone-700">Is Active?</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t border-stone-100 mt-6">
            <Link href="/admin/coupons" className="px-5 py-2.5 rounded-md border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 transition">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-md bg-stone-950 text-white font-semibold hover:bg-teal-700 disabled:opacity-50 transition">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
