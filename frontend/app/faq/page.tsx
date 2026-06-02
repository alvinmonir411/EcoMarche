import PolicyPage from "@/components/content/PolicyPage";

export default function FaqPage() {
  return (
    <PolicyPage
      eyebrow="Help"
      title="Frequently Asked Questions"
      intro="Quick answers for shopping, checkout, delivery, and account management on EcoMarche."
      sections={[
        { title: "Can I pay cash on delivery?", body: "Yes. COD can be controlled from the admin dashboard delivery and payment settings." },
        { title: "How do I track an order?", body: "Use the order tracking page or open your account dashboard to view order history and delivery status." },
        { title: "How are products managed?", body: "Admins can manage products, categories, brands, sections, banners, coupons, stock, and SEO from the dashboard." },
      ]}
    />
  );
}
