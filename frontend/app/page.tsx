"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import { productApi, categoryApi } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/utils/image";
import {
  FASTLAIN_PLACEHOLDER,
  bannerFashionImages,
  categoryFashionImages,
  getProductFallbackImage,
} from "@/utils/fashionImages";

const fallbackCategories = [
  { id: 1, name: "Women Dress", slug: "women-dress", image: categoryFashionImages["women-dress"] },
  { id: 2, name: "Men Clothing", slug: "men-clothing", image: categoryFashionImages["men-clothing"] },
  { id: 3, name: "Accessories", slug: "accessories", image: categoryFashionImages.accessories },
  { id: 4, name: "Winter Wear", slug: "winter-wear", image: categoryFashionImages["winter-wear"] },
  { id: 5, name: "T-Shirt", slug: "t-shirt", image: categoryFashionImages["t-shirt"] },
  { id: 6, name: "Saree", slug: "saree", image: categoryFashionImages.saree },
  { id: 7, name: "Kurti", slug: "kurti", image: categoryFashionImages.kurti },
  { id: 8, name: "Kids Dress", slug: "kids-dress", image: categoryFashionImages["kids-dress"] },
];

const brands = ["EcoWeave", "Pure Loom", "NaturaFit", "Urban Leaf"];

const testimonials = [
  {
    text: "The dress quality feels premium and the fit was exactly right. Delivery was quick and beautifully packed.",
    author: "Sadia Rahman",
    role: "Verified Buyer",
    avatar: "/images/avatar_female_1.png",
  },
  {
    text: "FastLain makes everyday fashion feel polished without losing comfort. I keep coming back for basics.",
    author: "Anika Sen",
    role: "Member",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=160",
  },
  {
    text: "Clean designs, fair prices, and the fabric feels better than most online shops I have tried.",
    author: "Farhan Ahmed",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160",
  },
];

type HomeCategory = {
  id: number | string;
  name: string;
  slug: string;
  image: string;
};

type HomeProduct = {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
  imageUrl?: string;
  category?: string | { name?: string; slug?: string; id?: string | number };
  slug: string;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  rating?: number;
  stock?: number;
};

const productSections = [
  { title: "All Women Dress", href: "/shop?category=women-dress", start: 0, count: 5 },
  { title: "Premium Collection", href: "/shop", start: 5, count: 5 },
  { title: "Seasonal Essentials", href: "/shop?category=winter-wear", start: 10, count: 5 },
  { title: "Organic / Sustainable Certified", href: "/shop", start: 15, count: 5 },
];

function getProductImage(product: HomeProduct, index = 0) {
  const explicitImage = product.imageUrl || product.image;
  const image = explicitImage && !explicitImage.includes("prod_")
    ? explicitImage
    : getProductFallbackImage(product.slug || product.id || `${product.name}-${index}`);
  return getImageUrl(image);
}

function FashionImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const [imageSrc, setImageSrc] = useState(src || FASTLAIN_PLACEHOLDER);

  return (
    <Image
      key={src}
      src={imageSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      onError={() => setImageSrc(FASTLAIN_PLACEHOLDER)}
      className={className}
    />
  );
}

function repeatSlice(products: HomeProduct[], start: number, count: number) {
  if (products.length === 0) return [];
  return Array.from({ length: Math.min(count, Math.max(products.length, count)) }, (_, index) => products[(start + index) % products.length]).slice(0, count);
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 md:mb-5">
      <div>
        <h2 className="text-base font-black tracking-tight text-secondary md:text-xl">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-primary" />
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-primary hover:text-secondary">
          View All
        </Link>
      )}
    </div>
  );
}

function TopSellingCard({ product, index }: { product: HomeProduct; index: number }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const salePrice = Number(product.discountPrice || product.price || 0);
  const oldPrice = product.discountPrice ? Number(product.price || 0) : salePrice + 18 + index * 3;

  const addProduct = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: salePrice,
      image: getProductImage(product, index),
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0] || "Default",
      quantity: 1,
    });
  };

  return (
    <div className="relative grid min-h-44 grid-cols-[42%_1fr] overflow-hidden rounded-md border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md">
      <span className="absolute right-3 top-3 rounded-sm bg-red-500 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">Best Selling</span>
      <Link href={`/products/${product.slug}`} className="relative min-h-36 overflow-hidden rounded bg-[#f7f7f4]">
        <FashionImage src={getProductImage(product, index)} alt={product.name} sizes="(max-width: 768px) 42vw, 260px" className={`object-cover object-center transition-transform duration-700 hover:scale-105 ${isOutOfStock ? "opacity-70" : ""}`} />
      </Link>
      <div className="flex min-w-0 flex-col justify-center gap-2.5 pl-4 pr-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-secondary hover:text-primary md:text-base">{product.name}</h3>
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-black text-primary">${salePrice.toFixed(2)}</span>
          <span className="text-[11px] font-bold text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={addProduct}
            disabled={isOutOfStock}
            className="min-h-9 rounded-md border border-primary px-2 text-[9px] font-black uppercase tracking-[0.08em] text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {isOutOfStock ? "Out" : "Add To Cart"}
          </button>
          <button
            type="button"
            onClick={() => {
              addProduct();
              if (!isOutOfStock) router.push("/checkout");
            }}
            disabled={isOutOfStock}
            className="min-h-9 rounded-md bg-secondary px-2 text-[9px] font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function ComboCard({ product, index }: { product: HomeProduct; index: number }) {
  return (
    <div className="min-w-[170px] overflow-hidden rounded-md border border-accent-dark bg-white">
      <div className="relative aspect-[4/3] bg-[#faf7ef]">
        <FashionImage src={getProductImage(product, index)} alt={product.name} sizes="(max-width: 768px) 180px, 20vw" className="object-cover object-center" />
        <span className="absolute left-2 top-2 rounded-sm bg-secondary px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">Combo</span>
        <span className="absolute right-2 top-2 rounded-sm bg-primary px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">Save 15%</span>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 min-h-9 text-xs font-bold text-secondary">FastLain Combo {index + 1}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black text-primary">${Number(product.discountPrice || product.price || 0).toFixed(2)}</span>
          <span className="text-[10px] font-bold text-gray-400 line-through">${(Number(product.price || 0) + 24).toFixed(2)}</span>
        </div>
        <Link href={`/products/${product.slug}`} className="block rounded-md bg-secondary py-2 text-center text-[9px] font-black uppercase tracking-[0.1em] text-white hover:bg-primary">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const categoryScroller = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const slides = [
    {
      season: "EDITORIAL VOL. I",
      title: "The New Standard",
      subtitle: "Minimal silhouettes and premium materials curated for the modern individual.",
      image: bannerFashionImages.hero,
      link: "/shop",
    },
    {
      season: "SUMMER ESSENTIALS",
      title: "Summer Relaxed",
      subtitle: "Lightweight fabrics, breathable weaves, and relaxed modern tailoring.",
      image: bannerFashionImages.women,
      link: "/shop?category=women-dress",
    },
    {
      season: "NEW ARRIVALS",
      title: "Luxury Everyday",
      subtitle: "Timeless investment pieces crafted with meticulous detail and eco-conscious care.",
      image: bannerFashionImages.men,
      link: "/shop?category=men-clothing",
    },
    {
      season: "AUTUMN / WINTER",
      title: "Sustainable Knits",
      subtitle: "Luxurious organic cashmere sweaters and heavy-weight wool coats for cold seasons.",
      image: bannerFashionImages.editorial,
      link: "/shop?category=winter-wear",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ limit: 24 }),
        ]);

        if (catRes.success) {
          const catData = catRes.data;
          setCategories((Array.isArray(catData) ? catData : (catData?.data || catData?.categories || [])) as HomeCategory[]);
        }

        if (prodRes.success) {
          const prodData = prodRes.data;
          setProducts((Array.isArray(prodData) ? prodData : (prodData?.data || prodData?.products || [])) as HomeProduct[]);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
  };

  const displayCategories = categories.length > 0
    ? fallbackCategories.map((fallback) => {
        const matched = categories.find((c) => c.slug?.toLowerCase() === fallback.slug || c.name?.toLowerCase() === fallback.name.toLowerCase());
        return {
          id: matched?.id || fallback.id,
          name: matched?.name || fallback.name,
          slug: matched?.slug || fallback.slug,
          image: fallback.image,
        };
      })
    : fallbackCategories;

  const topSelling = repeatSlice(products, 0, 4);
  const comboDeals = repeatSlice(products, 4, 5);
  const justForYou = repeatSlice(products, 2, 10);

  return (
    <div className="overflow-x-hidden bg-accent text-secondary selection:bg-primary selection:text-white">
      <section className="bg-white pt-3 pb-5 md:pt-6 md:pb-8">
        <Container className="max-w-[1320px]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 lg:h-[70vh]">
            <div
              className="group relative h-[380px] max-h-[420px] overflow-hidden rounded-2xl border border-gray-100 shadow-sm sm:h-[420px] lg:col-span-8 lg:h-full lg:max-h-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {slides.map((slide, index) => (
                <div key={slide.title} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeSlide ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"}`}>
                  <Image src={slide.image} alt={slide.title} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-7 md:p-12">
                    <span className="mb-2 text-[9px] font-black uppercase tracking-[0.24em] text-white/80 md:mb-3 md:text-[10px] md:tracking-[0.3em]">{slide.season}</span>
                    <h1 className="mb-2 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:mb-3 md:text-6xl">{slide.title}</h1>
                    <p className="mb-4 max-w-[18rem] text-[11px] font-medium leading-relaxed text-white/75 line-clamp-2 sm:max-w-md md:mb-6 md:text-sm md:line-clamp-none">{slide.subtitle}</p>
                    <div className="flex gap-2 sm:gap-4">
                      <Link href={slide.link} className="bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-secondary shadow-sm transition-colors hover:bg-primary hover:text-white sm:px-8 sm:py-3.5 sm:text-[10px] sm:tracking-[0.2em]">
                        Shop Now
                      </Link>
                      <Link href="/shop" className="hidden border border-white/50 px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-secondary min-[380px]:block sm:px-6 sm:py-3.5 sm:text-[10px] sm:tracking-[0.2em]">
                        View Collection
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={prevSlide} className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white hover:text-secondary group-hover:opacity-100" aria-label="Previous Slide">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white hover:text-secondary group-hover:opacity-100" aria-label="Next Slide">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="hidden h-full grid-cols-1 gap-6 md:grid lg:col-span-4">
              {[
                { href: "/shop?category=accessories", image: bannerFashionImages.accessories, title: "Accessories Edit", eyebrow: "Accessories Collection" },
                { href: "/shop?category=essentials", image: bannerFashionImages.essentials, title: "Denim & Essentials", eyebrow: "New Arrivals" },
              ].map((promo) => (
                <Link key={promo.href} href={promo.href} className="group relative block min-h-[250px] overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                  <Image src={promo.image} alt={promo.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/45 transition-colors group-hover:bg-black/55" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
                    <span className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/70">{promo.eyebrow}</span>
                    <h3 className="mb-2 text-xl font-black tracking-tight text-white">{promo.title}</h3>
                    <span className="w-fit border-b-2 border-white/50 pb-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-white">Shop Now</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-5 md:py-8">
        <Container className="max-w-[1320px]">
          <SectionHeader title="Featured Categories" />
          <div className="relative group">
            <button type="button" onClick={() => categoryScroller.current?.scrollBy({ left: -300, behavior: "smooth" })} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-secondary shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-primary hover:text-white transition-all duration-300 md:flex opacity-0 group-hover:opacity-100" aria-label="Scroll categories left">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div ref={categoryScroller} className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
              {displayCategories.map((category) => (
                <Link key={category.id} href={`/shop?category=${category.slug}`} className="snap-start shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 w-[38vw] sm:w-[calc(33.333%-10.66px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-13.33px)]">
                  <div className="relative h-16 w-16 lg:h-20 lg:w-20 overflow-hidden rounded-full bg-[#f7f7f4]">
                    <Image src={category.image} alt={category.name} fill sizes="(max-width: 1024px) 64px, 80px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <span className="text-center text-[11px] lg:text-xs font-bold leading-tight text-secondary group-hover:text-primary transition-colors">{category.name}</span>
                </Link>
              ))}
            </div>
            <button type="button" onClick={() => categoryScroller.current?.scrollBy({ left: 300, behavior: "smooth" })} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-secondary shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-primary hover:text-white transition-all duration-300 md:flex opacity-0 group-hover:opacity-100" aria-label="Scroll categories right">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </Container>
      </section>

      <section className="py-4 md:py-7">
        <Container className="max-w-[1320px]">
          <SectionHeader title="Top Selling Products" href="/shop" />
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? [1, 2, 3, 4].map((item) => <div key={item} className="h-44 animate-pulse rounded-md bg-white" />) : topSelling.map((product, index) => <TopSellingCard key={`${product.id}-top-${index}`} product={product} index={index} />)}
          </div>
        </Container>
      </section>

      <section className="py-4 md:py-7">
        <Container className="max-w-[1320px]">
          <SectionHeader title="Our Brands" href="/shop" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {brands.map((brand) => (
              <div key={brand} className="flex h-16 items-center justify-center rounded-md border border-gray-100 bg-white text-lg font-black tracking-tight text-secondary shadow-sm">
                {brand}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-dark" />
          </div>
        </Container>
      </section>

      {productSections.slice(0, 1).map((section) => (
        <section key={section.title} className="py-4 md:py-7">
          <Container className="max-w-[1320px]">
            <SectionHeader title={section.title} href={section.href} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
              {repeatSlice(products, section.start, section.count).map((product, index) => <ProductCard key={`${section.title}-${product.id}-${index}`} product={product} />)}
            </div>
          </Container>
        </section>
      ))}

      <section className="bg-[#efe8dc] py-6 md:py-8">
        <Container className="max-w-[1320px]">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader title="Exclusive Combo Deals" />
            <Link href="/shop" className="rounded-md bg-secondary px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white hover:bg-primary">View All Combos</Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:px-0">
            {comboDeals.map((product, index) => <ComboCard key={`${product.id}-combo-${index}`} product={product} index={index} />)}
          </div>
        </Container>
      </section>

      {productSections.slice(1, 2).map((section) => (
        <section key={section.title} className="py-5 md:py-8">
          <Container className="max-w-[1320px]">
            <SectionHeader title={section.title} href={section.href} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
              {repeatSlice(products, section.start, section.count).map((product, index) => <ProductCard key={`${section.title}-${product.id}-${index}`} product={product} />)}
            </div>
          </Container>
        </section>
      ))}

      <section className="py-5 md:py-8">
        <Container className="max-w-[1320px]">
          <div className="relative h-56 overflow-hidden rounded-xl bg-secondary md:h-80">
            <Image src={bannerFashionImages.collection} alt="FastLain premium fashion banner" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <span className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/75">Premium Drop</span>
              <h2 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-5xl">Soft Tailoring For Everyday Elegance</h2>
              <Link href="/shop" className="mt-6 rounded-md bg-white px-7 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-secondary hover:bg-primary hover:text-white">Shop Collection</Link>
            </div>
          </div>
        </Container>
      </section>

      {productSections.slice(2).map((section) => (
        <section key={section.title} className="py-5 md:py-8">
          <Container className="max-w-[1320px]">
            <SectionHeader title={section.title} href={section.href} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
              {repeatSlice(products, section.start, section.count).map((product, index) => <ProductCard key={`${section.title}-${product.id}-${index}`} product={product} />)}
            </div>
          </Container>
        </section>
      ))}

      <section className="py-5 md:py-8">
        <Container className="max-w-[1320px]">
          <SectionHeader title="Just For You" href="/shop" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
            {justForYou.map((product, index) => <ProductCard key={`just-${product.id}-${index}`} product={product} />)}
          </div>
          <div className="mt-6 flex justify-center">
            <Link href="/shop" className="rounded-full border border-primary px-7 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-primary hover:bg-primary hover:text-white">Load More</Link>
          </div>
        </Container>
      </section>

      <section className="py-6 md:py-10">
        <Container className="max-w-[1320px]">
          <SectionHeader title="Customer Comments" />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.author} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex gap-1 text-gold">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-gray-600">&quot;{item.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                    <Image src={item.avatar} alt={item.author} fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-secondary">{item.author}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-dark" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-dark" />
          </div>
        </Container>
      </section>
    </div>
  );
}
