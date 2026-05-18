"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { productApi } from "@/services/api";
import { useCart } from "@/context/CartContext";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";

export default function ShopProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
          setError(errMsg || "Product not found or failed to load");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-40 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-4">{error || "Product Not Found"}</h2>
        <Link href="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-accent/10 shadow-lg">
            <Image
              src={getImageUrl(product.imageUrl || product.images?.[0] || getProductFallbackImage(product.slug || product.id || product.name))}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              {typeof product.category === 'string' ? product.category : (product.category?.name || "Uncategorized")}
            </p>
            <h1 className="text-4xl font-bold text-secondary mb-6">{product.name}</h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-primary">
                ${Number(product.discountPrice || product.price || 0).toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-lg text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-10">{product.description}</p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stock Status</p>
                <p className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} Units Available` : 'Out of Stock'}
                </p>
              </div>
              <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Standard Size</p>
                <p className="font-bold text-secondary">{product.size || product.sizes?.[0] || 'M'}</p>
              </div>
            </div>

            <Button
              size="lg"
              className="py-5 text-lg font-bold"
              disabled={product.stock <= 0}
              onClick={() => addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: getImageUrl(product.imageUrl || product.images?.[0] || getProductFallbackImage(product.slug || product.id || product.name)),
                size: product.size || product.sizes?.[0] || "M",
                color: product.color || product.colors?.[0] || "Default",
                quantity: 1
              })}
            >
              {product.stock > 0 ? 'Add to Shopping Bag' : 'Notify Me'}
            </Button>

            <Link href="/shop" className="mt-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
