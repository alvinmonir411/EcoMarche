"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/product/ProductCard";
import { productApi, categoryApi } from "@/services/api";
import Button from "@/components/ui/Button";

type Category = {
  id: string | number;
  name: string;
  slug: string;
};

type ShopProduct = {
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

type ApiListResponse<T> = T[] | {
  data?: T[];
  products?: T[];
  categories?: T[];
  total?: number;
  meta?: {
    totalItems?: number;
  };
};

const formatSlugTitle = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(Number(searchParams.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || 2000);
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const limit = 12;

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return "All Products";
    const category = categories.find((cat) => cat.slug === selectedCategory || cat.name.toLowerCase() === selectedCategory.toLowerCase());
    return category?.name || formatSlugTitle(selectedCategory);
  }, [categories, selectedCategory]);

  const syncUrl = useCallback((updates: Record<string, string | number | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === 0 || value === false || value === "latest" || (key === "maxPrice" && value === 2000) || (key === "page" && value === 1)) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const updateCategory = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    syncUrl({ category, page: 1 });
  };

  const updateSort = (value: string) => {
    setSort(value);
    setPage(1);
    syncUrl({ sort: value, page: 1 });
  };

  const updateMaxPrice = (value: number) => {
    setMaxPrice(value);
    setPage(1);
    syncUrl({ maxPrice: value, page: 1 });
  };

  const fetchCategories = useCallback(async () => {
    const res = await categoryApi.getAll();
    if (res.success) {
      const catData = res.data as ApiListResponse<Category>;
      setCategories(Array.isArray(catData) ? catData : (catData?.data || catData?.categories || []));
    }
  }, []);

  const updateInStock = (value: boolean) => {
    setInStock(value);
    setPage(1);
    syncUrl({ inStock: value, page: 1 });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sort,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== "all") params.category = selectedCategory;
      if (minPrice > 0) params.minPrice = minPrice;
      if (maxPrice < 2000) params.maxPrice = maxPrice;
      if (inStock) params.inStock = "true";

      const res = await productApi.getAll(params);
      if (res.success) {
        const prodData = res.data as ApiListResponse<ShopProduct>;
        const prodArray = Array.isArray(prodData) ? prodData : (prodData?.data || prodData?.products || []);
        setProducts(prodArray);
        setTotalProducts(Array.isArray(prodData) ? prodArray.length : (prodData.total || prodData.meta?.totalItems || prodArray.length));
      }
    } catch (error) {
      console.error("Error fetching shop products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, sort, searchTerm, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const nextCategory = searchParams.get("category") || "";
    const nextSearch = searchParams.get("search") || "";
    const nextSort = searchParams.get("sort") || "latest";
    const nextPage = Number(searchParams.get("page")) || 1;
    const nextMinPrice = Number(searchParams.get("minPrice")) || 0;
    const nextMaxPrice = Number(searchParams.get("maxPrice")) || 2000;
    const nextInStock = searchParams.get("inStock") === "true";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(nextCategory);
    setSearchTerm(nextSearch);
    setSort(nextSort);
    setPage(nextPage);
    setMinPrice(nextMinPrice);
    setMaxPrice(nextMaxPrice);
    setInStock(nextInStock);
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const totalPages = Math.ceil(totalProducts / limit) || 1;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setMinPrice(0);
    setMaxPrice(2000);
    setSort("latest");
    setPage(1);
    setInStock(false);
    setIsFilterOpen(false);
    router.replace(pathname, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    syncUrl({ search: value, page: 1 });
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-5 text-secondary md:pb-12 md:pt-20">
      <Container>
        <div className="mb-4 md:mb-12">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-xs">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>&gt;</span>
            <span className="text-secondary">{selectedCategoryName}</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-secondary md:text-5xl">
                {selectedCategoryName}
              </h1>
              <p className="mt-1 text-xs font-bold text-gray-500 md:mt-3 md:text-sm">
                {loading ? "Updating collection..." : `${totalProducts} products ready to shop`}
              </p>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={handleReset}
                className="hidden text-[10px] font-black uppercase tracking-[0.16em] text-primary underline underline-offset-4 md:block"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-[auto_1fr_1fr] gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex h-11 items-center justify-center gap-2 border border-gray-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.12em] shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M6 12h12M10 19h4" /></svg>
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateSort(e.target.value)}
            className="h-11 min-w-0 border border-gray-200 bg-white px-2 text-[10px] font-black uppercase text-secondary shadow-sm outline-none"
            aria-label="Sort products"
          >
            <option value="latest">Newest</option>
            <option value="price_asc">Low Price</option>
            <option value="price_desc">High Price</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => updateCategory(e.target.value)}
            className="h-11 min-w-0 border border-gray-200 bg-white px-2 text-[10px] font-black uppercase text-secondary shadow-sm outline-none"
            aria-label="Choose category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-12">
          <aside className="hidden w-full flex-shrink-0 lg:block lg:w-72">
            <div className="sticky top-28 rounded-2xl bg-accent/20 p-8">
              <div className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Search</h3>
                  <button onClick={() => handleSearchChange("")} className="text-[10px] font-bold uppercase text-primary hover:underline">Clear</button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Find your style..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full rounded-lg border-none bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary"
                  />
                  <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Categories</h3>
                  <button onClick={() => updateCategory("")} className="text-[10px] font-bold uppercase text-primary hover:underline">All</button>
                </div>
                <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="group flex cursor-pointer items-center space-x-3">
                      <input
                        type="radio"
                        name="category"
                        className="h-5 w-5 cursor-pointer rounded-full border-gray-300 text-primary focus:ring-primary"
                        checked={selectedCategory === cat.slug}
                        onChange={() => updateCategory(cat.slug)}
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "text-primary" : "text-gray-600 group-hover:text-primary"}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-secondary">Price Range</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">৳{minPrice} - ৳{maxPrice}</span>
                </div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Max Price</p>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => updateMaxPrice(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
                />
                <div className="mt-2 flex justify-between text-[10px] font-bold text-gray-300">
                  <span>৳0</span>
                  <span>৳2000</span>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-lg font-bold mb-5">Availability</h3>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${inStock ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${inStock ? 'left-5' : 'left-1'}`}></div>
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={inStock}
                    onChange={(e) => updateInStock(e.target.checked)}
                  />
                  <span className={`text-sm font-medium ${inStock ? 'text-primary' : 'text-gray-600'}`}>In Stock Only</span>
                </label>
              </div>

              <button
                onClick={handleReset}
                className="w-full rounded-xl bg-secondary py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-secondary/10 transition-all hover:bg-primary"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-5 hidden items-center justify-between gap-4 lg:flex">
              <p className="font-medium text-gray-500">
                {loading ? "Updating collection..." : `Showing ${products.length} of ${totalProducts} sustainable products`}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => updateSort(e.target.value)}
                  className="cursor-pointer rounded-lg border-none bg-accent/30 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="latest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-accent/10 bg-white shadow-sm md:rounded-2xl">
                    <div className="aspect-[4/5] animate-pulse bg-accent/10 md:aspect-[3/4]"></div>
                    <div className="space-y-3 p-3 md:p-5">
                      <div className="h-2 w-16 animate-pulse rounded bg-accent/20"></div>
                      <div className="h-4 w-full animate-pulse rounded bg-accent/20"></div>
                      <div className="h-4 w-20 animate-pulse rounded bg-accent/20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : Array.isArray(products) && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2 md:mt-16">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPage(i);
                          syncUrl({ page: i });
                        }}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold shadow-sm transition-all md:h-12 md:w-12 ${page === i ? "bg-primary text-white shadow-lg shadow-primary/30" : "border border-accent/10 bg-white text-secondary hover:border-primary/50"}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-accent/20 bg-accent/5 px-4 py-20 text-center md:rounded-[40px] md:py-32">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-gray-300 shadow-xl shadow-secondary/5 md:h-24 md:w-24">
                  <svg className="h-9 w-9 md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-secondary md:text-2xl">No matches found</h3>
                <p className="mx-auto mb-8 max-w-xs text-sm text-gray-500">We could not find any products matching your current filters. Try resetting them.</p>
                <Button onClick={handleReset} variant="outline">Clear All Filters</Button>
              </div>
            )}
          </main>
        </div>
      </Container>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight">Filters</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-secondary"
                aria-label="Close filters"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Search</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Find your style..."
                  className="mt-2 h-12 w-full border border-gray-200 bg-white px-4 text-sm font-bold outline-none focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Max Price</span>
                <div className="mt-2 flex items-center justify-between text-xs font-black text-primary">
                  <span>৳{minPrice}</span>
                  <span>৳{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => updateMaxPrice(Number(e.target.value))}
                  className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-secondary">In Stock Only</span>
                <div className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${inStock ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${inStock ? 'left-5' : 'left-1'}`}></div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={inStock}
                    onChange={(e) => updateInStock(e.target.checked)}
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-12 border border-gray-200 bg-white text-[10px] font-black uppercase tracking-[0.16em] text-secondary"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="h-12 bg-secondary text-[10px] font-black uppercase tracking-[0.16em] text-white"
                >
                  Show Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
