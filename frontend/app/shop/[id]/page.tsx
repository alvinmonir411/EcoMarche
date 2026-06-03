"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { productApi, reviewApi } from "@/services/api";
import { useCart } from "@/context/CartContext";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getImageUrl } from "@/utils/image";
import { getProductFallbackImage } from "@/utils/fashionImages";
import toast from "react-hot-toast";
import ProductCard from "@/components/product/ProductCard";

type Review = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string; image?: string };
};

export default function ShopProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Review States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sticky Cart State
  const [showStickyCart, setShowStickyCart] = useState(false);
  const primaryCartButtonRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Related Products
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const fetchProductAndReviews = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await productApi.getBySlug(slug);
      if (res.success && res.data) {
        setProduct(res.data);
        const productId = res.data.id;
        
        // Fetch Reviews
        const reviewsRes = await reviewApi.getProductReviews(productId);
        if (reviewsRes.success && reviewsRes.data?.reviews) {
          setReviews(reviewsRes.data.reviews);
        }
        
        // Check if can review
        const canReviewRes = await reviewApi.canReview(productId);
        if (canReviewRes.success) {
          setCanReview(canReviewRes.data?.canReview || false);
        }

        // Fetch Related Products
        const category = typeof res.data.category === 'string' ? res.data.category : res.data.category?.name;
        if (category) {
          const relatedRes = await productApi.getAll({ category, limit: 5 });
          if (relatedRes.success && relatedRes.data?.data) {
            setRelatedProducts(relatedRes.data.data.filter((p: any) => p.id !== productId).slice(0, 4));
          }
        }
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Product not found or failed to load");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProductAndReviews();
  }, [fetchProductAndReviews]);

  useEffect(() => {
    const handleScroll = () => {
      if (primaryCartButtonRef.current) {
        const rect = primaryCartButtonRef.current.getBoundingClientRect();
        // Show sticky bar when the primary button is scrolled out of view (above the viewport)
        setShowStickyCart(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setIsSubmittingReview(true);
    try {
      const res = await reviewApi.createReview(product.id, { rating: reviewRating, comment: reviewComment });
      if (res.success) {
        toast.success("Review submitted successfully!");
        setCanReview(false);
        setReviewComment("");
        fetchProductAndReviews(); // Refresh reviews
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        toast.error(errMsg || "Failed to submit review.");
      }
    } catch (err) {
      toast.error("An error occurred while submitting.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    await addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: getImageUrl(product.imageUrl || product.images?.[0] || getProductFallbackImage(product.slug || product.id || product.name)),
      size: product.sizes?.[0] || "M",
      color: product.colors?.[0] || "Default",
      quantity: 1
    });
    setIsAdding(false);
  };

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

  const averageRating = product.rating || (reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) : 0);

  return (
    <div className="py-10 md:py-20 bg-white">
      <Container>
        {/* Product Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div 
            className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-accent/10 shadow-lg group cursor-crosshair"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;
              e.currentTarget.style.setProperty('--x', `${x}%`);
              e.currentTarget.style.setProperty('--y', `${y}%`);
            }}
          >
            <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[2] origin-[var(--x,50%)_var(--y,50%)]">
              <Image
                src={getImageUrl(product.imageUrl || product.images?.[0] || getProductFallbackImage(product.slug || product.id || product.name))}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              {typeof product.category === 'string' ? product.category : (product.category?.name || "Uncategorized")}
            </p>
            <h1 className="text-4xl font-bold text-secondary mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500">({reviews.length} reviews)</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-primary">
                ৳{Number(product.discountPrice || product.price || 0).toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-lg text-gray-400 line-through">৳{Number(product.price).toFixed(2)}</span>
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
                <p className="font-bold text-secondary">{product.sizes?.[0] || 'M'}</p>
              </div>
            </div>

            <div ref={primaryCartButtonRef}>
              <Button
                size="lg"
                className="py-5 text-lg font-bold w-full flex items-center justify-center gap-3"
                disabled={product.stock <= 0 || isAdding}
                onClick={handleAddToCart}
              >
                {isAdding ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Adding...
                  </>
                ) : product.stock > 0 ? 'Add to Shopping Bag' : 'Notify Me'}
              </Button>
            </div>

            <Link href="/shop" className="mt-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-all block">
              ← Back to Shop
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto pt-16 border-t border-gray-100">
          <h3 className="text-3xl font-bold text-secondary mb-10">Customer Reviews</h3>
          
          {canReview && (
            <div className="bg-stone-50 p-6 md:p-8 rounded-3xl mb-12 border border-stone-100">
              <h4 className="text-xl font-bold text-secondary mb-4">Write a Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <svg className={`w-8 h-8 transition-colors ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-bold text-gray-500 mb-2">Review (Optional)</label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-primary focus:ring-primary rounded-xl px-4 py-3 outline-none resize-none"
                    placeholder="What did you like or dislike?"
                  ></textarea>
                </div>
                <Button type="submit" disabled={isSubmittingReview}>
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="pb-8 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold uppercase">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h5 className="font-bold text-secondary">{review.user?.name || 'Anonymous'}</h5>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 pl-14">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-24 border-t border-gray-100 mt-20">
            <h3 className="text-3xl font-bold text-secondary mb-10 text-center">You Might Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Sticky Add to Cart Bar */}
      {showStickyCart && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-300 py-3 hidden md:block">
          <Container className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                <Image src={getImageUrl(product.imageUrl || product.images?.[0] || getProductFallbackImage(product.slug || product.id || product.name))} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-secondary line-clamp-1">{product.name}</h4>
                <p className="text-primary font-bold text-sm">৳{Number(product.discountPrice || product.price || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleAddToCart} disabled={product.stock <= 0 || isAdding} className="px-8 py-3 flex items-center justify-center gap-2 min-w-[140px]">
                {isAdding ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Adding...
                  </>
                ) : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
