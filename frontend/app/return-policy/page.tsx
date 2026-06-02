import PolicyPage from "@/components/content/PolicyPage";

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Returns"
      title="Return Policy"
      intro="EcoMarche keeps returns simple for unused products that arrive damaged, incorrect, or materially different from the order."
      sections={[
        { title: "Return Window", body: "Eligible products can be requested for return within 7 days of delivery with packaging and proof of purchase." },
        { title: "Non-returnable Items", body: "Used, washed, altered, or hygiene-sensitive products may be declined unless they arrived damaged or incorrect." },
        { title: "Refunds", body: "Approved refunds are processed to the original payment route or resolved through support for cash on delivery orders." },
      ]}
    />
  );
}
