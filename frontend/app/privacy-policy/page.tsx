import PolicyPage from "@/components/content/PolicyPage";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="EcoMarche collects only the information needed to run customer accounts, delivery, payment, and order support."
      sections={[
        { title: "Data We Store", body: "We store account details, delivery addresses, cart items, wishlist items, order records, and payment status metadata." },
        { title: "How We Use Data", body: "Customer data is used for checkout, order tracking, support, fraud prevention, and admin dashboard reporting." },
        { title: "Security", body: "Protected routes, hashed passwords, role checks, and server-side validation are used to reduce unauthorized access." },
      ]}
    />
  );
}
