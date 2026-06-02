import Container from "@/components/ui/Container";

type PolicyPageProps = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function PolicyPage({ title, eyebrow, intro, sections }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-white py-24 text-secondary">
      <Container>
        <div className="mx-auto max-w-3xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-5 text-base font-medium leading-8 text-gray-600">{intro}</p>
          <div className="mt-12 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-accent/40 pt-8">
                <h2 className="text-xl font-black text-secondary">{section.title}</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-gray-600">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
