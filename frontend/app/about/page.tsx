import Container from "@/components/ui/Container";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us - EcoMarche",
  description: "Learn more about EcoMarche, a premium fashion e-commerce store focused on modern, sustainable, and stylish dress items.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-40 bg-accent/10 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-10"></div>
          {/* We'll use a CSS pattern or simple gradient if an image isn't available, but a subtle graphic works nicely */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1c2222_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        
        <Container className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest animate-fade-in-up">
              Our Journey
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-secondary tracking-tight animate-fade-in-up animation-delay-100">
              Redefining Premium <span className="text-primary">Fashion</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-200">
              EcoMarche is more than just a store; it's a statement. We bring you modern, sustainable, and meticulously crafted apparel that speaks to your unique style.
            </p>
          </div>
        </Container>
      </section>

      {/* Our Story Section */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative">
              <div className="absolute -left-8 -top-8 w-24 h-24 bg-accent rounded-full opacity-50 blur-3xl z-0"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 relative inline-block">
                  Our Story
                  <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Founded with a vision to merge aesthetic brilliance with everyday comfort, EcoMarche started as a small boutique dedicated to high-quality fabrics. Today, we've grown into a globally recognized brand that champions ethical sourcing without compromising on luxury.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Every piece in our collection is curated with an eye for detail, ensuring that our customers don't just wear clothes—they wear confidence. We believe in fashion that empowers and inspires.
                </p>
              </div>
            </div>
            
            {/* Image Placeholder with Styling */}
            <div className="relative h-[500px] rounded-[2rem] overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              {/* If you have a specific image in public dir, replace the above div with: 
              <Image src="/your-image.jpg" alt="Our Story" fill className="object-cover group-hover:scale-105 transition-transform duration-700" /> */}
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values Section */}
      <section className="py-20 lg:py-28 bg-stone-50 border-y border-stone-100">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Core Values</h2>
            <p className="text-gray-500 text-lg">The principles that guide our design, sourcing, and customer experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Sustainable Quality",
                desc: "We prioritize eco-friendly materials and ethical manufacturing processes, ensuring our footprint is as light as our fabrics.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              },
              {
                title: "Modern Aesthetics",
                desc: "Clean lines, timeless silhouettes, and bold accents. Our designs are crafted for the contemporary individual.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              },
              {
                title: "Customer First",
                desc: "Your satisfaction is our masterpiece. We offer seamless shopping experiences, easy returns, and dedicated support.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-stone-100 hover:-translate-y-2">
                <div className="w-16 h-16 bg-accent/20 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <Container>
          <div className="bg-secondary text-white rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-black">Ready to Elevate Your Wardrobe?</h2>
              <p className="text-lg text-gray-300">
                Explore our latest collection and discover pieces that will transform your everyday style.
              </p>
              <div className="pt-4">
                <Link href="/shop" className="inline-block bg-primary text-white font-bold text-sm uppercase tracking-widest py-4 px-10 rounded-full hover:bg-white hover:text-primary transition-colors duration-300 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
