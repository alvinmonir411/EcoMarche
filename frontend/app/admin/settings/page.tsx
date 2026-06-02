"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { deliverySettingsApi, settingsApi } from "@/services/api";

export default function AdminSettingsPage() {
  const [site, setSite] = useState({
    brandName: "EcoMarche",
    supportEmail: "support@ecomarche.com",
    currency: "USD",
    logoUrl: "",
    themeColor: "#163020",
    seoTitle: "",
    seoDescription: "",
    footerText: "Premium sustainable marketplace.",
  });
  const [delivery, setDelivery] = useState({
    insideDhaka: 70,
    outsideDhaka: 130,
    freeShippingOver: 150,
    codEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [settingsRes, deliveryRes] = await Promise.all([
        settingsApi.get(),
        deliverySettingsApi.getAll(),
      ]);

      if (settingsRes.success && settingsRes.data) {
        const value = settingsRes.data.value || {};
        setSite((prev) => ({
          ...prev,
          brandName: value.brandName || prev.brandName,
          supportEmail: value.supportEmail || prev.supportEmail,
          currency: value.currency || prev.currency,
          logoUrl: settingsRes.data.logoUrl || "",
          themeColor: settingsRes.data.themeColor || prev.themeColor,
          seoTitle: settingsRes.data.seoTitle || "",
          seoDescription: settingsRes.data.seoDescription || "",
          footerText: settingsRes.data.footer?.text || prev.footerText,
        }));
      }

      const firstDelivery = Array.isArray(deliveryRes.data) ? deliveryRes.data[0] : null;
      if (deliveryRes.success && firstDelivery) {
        setDelivery({
          insideDhaka: Number(firstDelivery.insideDhaka || 70),
          outsideDhaka: Number(firstDelivery.outsideDhaka || 130),
          freeShippingOver: Number(firstDelivery.freeShippingOver || 150),
          codEnabled: Boolean(firstDelivery.codEnabled),
        });
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const [settingsRes, deliveryRes] = await Promise.all([
      settingsApi.update({
        key: "site",
        value: {
          brandName: site.brandName,
          supportEmail: site.supportEmail,
          currency: site.currency,
        },
        logoUrl: site.logoUrl,
        themeColor: site.themeColor,
        footer: { text: site.footerText },
        seoTitle: site.seoTitle,
        seoDescription: site.seoDescription,
      }),
      deliverySettingsApi.create({
        name: "Dashboard delivery settings",
        insideDhaka: delivery.insideDhaka,
        outsideDhaka: delivery.outsideDhaka,
        freeShippingOver: delivery.freeShippingOver,
        codEnabled: delivery.codEnabled,
        active: true,
      }),
    ]);
    setSaving(false);

    if (!settingsRes.success || !deliveryRes.success) {
      alert(settingsRes.error || deliveryRes.error || "Failed to save settings");
      return;
    }

    alert("Settings saved successfully.");
  };

  return (
    <div className="min-h-screen bg-accent/5 py-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <AdminSidebar />
          <main className="flex-1">
            <header className="mb-10">
              <h1 className="text-4xl font-black tracking-tight text-secondary">Website Settings</h1>
              <p className="mt-2 text-sm font-bold text-gray-500">Manage logo, theme color, footer, SEO, delivery charge, COD, and payment gateway readiness.</p>
            </header>

            <form onSubmit={saveSettings} className="grid gap-8">
              <section className="rounded-[32px] border border-accent/20 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-black text-secondary">Brand & SEO</h2>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Brand name" value={site.brandName} onChange={(value) => setSite((prev) => ({ ...prev, brandName: value }))} />
                  <Field label="Support email" value={site.supportEmail} onChange={(value) => setSite((prev) => ({ ...prev, supportEmail: value }))} />
                  <Field label="Logo URL" value={site.logoUrl} onChange={(value) => setSite((prev) => ({ ...prev, logoUrl: value }))} />
                  <Field label="Theme color" type="color" value={site.themeColor} onChange={(value) => setSite((prev) => ({ ...prev, themeColor: value }))} />
                  <Field label="SEO title" value={site.seoTitle} onChange={(value) => setSite((prev) => ({ ...prev, seoTitle: value }))} />
                  <Field label="Currency" value={site.currency} onChange={(value) => setSite((prev) => ({ ...prev, currency: value }))} />
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">SEO description</span>
                    <textarea value={site.seoDescription} onChange={(event) => setSite((prev) => ({ ...prev, seoDescription: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" />
                  </label>
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Footer text</span>
                    <textarea value={site.footerText} onChange={(event) => setSite((prev) => ({ ...prev, footerText: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold outline-none focus:border-primary" />
                  </label>
                </div>
              </section>

              <section className="rounded-[32px] border border-accent/20 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-black text-secondary">Delivery & Payment</h2>
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Inside Dhaka charge" type="number" value={String(delivery.insideDhaka)} onChange={(value) => setDelivery((prev) => ({ ...prev, insideDhaka: Number(value) }))} />
                  <Field label="Outside Dhaka charge" type="number" value={String(delivery.outsideDhaka)} onChange={(value) => setDelivery((prev) => ({ ...prev, outsideDhaka: Number(value) }))} />
                  <Field label="Free shipping over" type="number" value={String(delivery.freeShippingOver)} onChange={(value) => setDelivery((prev) => ({ ...prev, freeShippingOver: Number(value) }))} />
                </div>
                <label className="mt-6 flex items-center gap-3">
                  <input type="checkbox" checked={delivery.codEnabled} onChange={(event) => setDelivery((prev) => ({ ...prev, codEnabled: event.target.checked }))} className="h-5 w-5 accent-primary" />
                  <span className="text-sm font-black uppercase tracking-widest text-secondary">Cash on delivery enabled</span>
                </label>
                <p className="mt-4 text-xs font-bold text-gray-400">Stripe keys are read from environment variables and exposed through the payment session API when configured.</p>
              </section>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
              </div>
            </form>
          </main>
        </div>
      </Container>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-accent/20 bg-accent/5 px-4 text-sm font-bold outline-none focus:border-primary" />
    </label>
  );
}
