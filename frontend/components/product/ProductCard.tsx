"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import { FASTLAIN_PLACEHOLDER, getProductFallbackImage } from '@/utils/fashionImages';

interface Product {
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
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image: getImageUrl(getProductImage()),
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0] || "Default",
      quantity: 1
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getProductImage = () => {
    const explicitImage = product.imageUrl || product.image;
    if (explicitImage && !explicitImage.includes("prod_")) return explicitImage;
    return getProductFallbackImage(product.slug || product.id || product.name);
  };

  const displayImage = getImageUrl(getProductImage());
  const [imageSrc, setImageSrc] = useState(displayImage);
  const discountPercent = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-secondary transition-all duration-300 hover:border-gray-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#f7f7f4] md:aspect-[3/4]">
        {displayImage ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            onError={() => setImageSrc(FASTLAIN_PLACEHOLDER)}
            className={`object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] ${isOutOfStock ? 'opacity-70 grayscale-[8%]' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            No Image
          </div>
        )}

        {!isOutOfStock && discountPercent > 0 && (
          <div className="absolute right-2 top-2 z-10 md:right-3 md:top-3">
            <span className="rounded-sm bg-primary px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white md:text-[9px]">
              Save {discountPercent}%
            </span>
          </div>
        )}

        {/* Favorite/Wishlist Button */}
        <div className="absolute left-2 top-2 z-20 md:left-3 md:top-3">
          <button 
            onClick={handleWishlist}
            className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-all duration-300 hover:scale-105 md:h-8 md:w-8 ${
              isFavorite ? 'bg-primary text-white border-primary' : 'bg-white/90 text-secondary border-gray-100 hover:border-primary hover:text-primary'
            }`}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg className="h-3.5 w-3.5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5 md:gap-3 md:p-4">
        <div className="min-h-[2.4rem] md:min-h-[2.9rem]">
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-secondary transition-colors group-hover:text-primary md:text-[15px]">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="flex flex-wrap items-baseline gap-1.5 md:gap-2">
           <span className="text-sm font-black text-primary md:text-base">${Number(product.discountPrice || product.price || 0).toFixed(2)}</span>
           {product.discountPrice && (
             <span className="text-[10px] font-bold text-gray-400 line-through md:text-xs">${Number(product.price).toFixed(2)}</span>
           )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-auto flex min-h-10 w-full items-center justify-center gap-2 rounded-md border px-2 text-[10px] font-black uppercase tracking-[0.1em] transition-colors duration-300 md:min-h-11 md:text-[11px] ${
            isOutOfStock
              ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
              : "border-primary bg-white text-primary hover:bg-primary hover:text-white"
          }`}
        >
          {!isOutOfStock && (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          )}
          {isOutOfStock ? "Out of Stock" : "Add To Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
