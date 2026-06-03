"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/utils/image";

type CartItemProps = {
  item: any;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [loading, setLoading] = useState(false);

  // Fallback for demo structure vs real API structure
  const product = item.product || item; 
  const price = product.discountPrice ?? product.price;
  const itemTotal = price * item.quantity;

  const handleDecrease = async () => {
    if (item.quantity <= 1) return;
    setLoading(true);
    await onUpdateQuantity(item.id, item.quantity - 1);
    setLoading(false);
  };

  const handleIncrease = async () => {
    setLoading(true);
    await onUpdateQuantity(item.id, item.quantity + 1);
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(item.id);
    setLoading(false);
  };

  return (
    <article className={`grid gap-4 border-b border-stone-200 py-5 last:border-b-0 sm:grid-cols-[120px_1fr] transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone-100 sm:w-[120px]">
        <Image
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          fill
          sizes="120px"
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-stone-500">{product.category}</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">
            {product.name}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Size: {item.selectedSize || product.sizes?.[0] || 'N/A'} | Color: {item.selectedColor || product.colors?.[0] || 'N/A'}
          </p>
          <p className="mt-2 font-semibold text-stone-950">৳{price}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <div className="flex min-h-11 items-center rounded-md border border-stone-300 bg-white">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="min-h-11 min-w-11 px-3 text-lg text-stone-700 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-10 text-center text-sm font-semibold text-stone-950">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              className="min-h-11 min-w-11 px-3 text-lg text-stone-700"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            Remove
          </button>

          <p className="w-full text-right font-semibold text-stone-950 md:w-24">
            ৳{itemTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </article>
  );
}
