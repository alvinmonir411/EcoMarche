import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { getImageUrl } from "@/utils/image";

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group overflow-hidden rounded-lg border border-stone-200 bg-white"
    >
      <div className="relative aspect-[4/3] bg-accent">
        <Image
          src={getImageUrl(category.imageUrl)}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-950 group-hover:text-teal-700">
          {category.name}
        </h3>
        <p className="mt-2 text-sm text-stone-600">{category.description}</p>
      </div>
    </Link>
  );
}
