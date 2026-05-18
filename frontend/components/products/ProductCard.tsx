import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = getImageUrl(product.imageUrl || getProductFallbackImage(product.slug || product.id));

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-100">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="mt-3">
        <p className="text-sm text-stone-500">{product.category}</p>
        <h3 className="mt-1 min-h-12 text-base font-semibold text-stone-950 group-hover:text-teal-700">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-stone-700">
          <p className="font-semibold">${product.discountPrice ?? product.price}</p>
          {product.discountPrice ? (
            <p className="text-sm text-stone-400 line-through">${product.price}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
