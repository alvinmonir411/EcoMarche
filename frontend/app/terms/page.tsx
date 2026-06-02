import PolicyPage from "@/components/content/PolicyPage";

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Store policy"
      title="Terms & Conditions"
      intro="These terms define how customers, vendors, and administrators use the EcoMarche marketplace."
      sections={[
        { title: "Orders", body: "Orders are confirmed after customer details, stock, payment method, and delivery area are validated." },
        { title: "Payments", body: "EcoMarche supports cash on delivery and is structured for online card payments through Stripe when gateway keys are configured." },
        { title: "Accounts", body: "Customers are responsible for accurate account, phone, and delivery information. Admin access is role protected." },
      ]}
    />
  );
}
