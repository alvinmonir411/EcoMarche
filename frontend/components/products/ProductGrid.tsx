import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/lib/types";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
