"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { productApi, reviewApi } from "@/services/api";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { getImageUrl } from "@/utils/image";
import { FASTLAIN_PLACEHOLDER, getProductFallbackImage } from "@/utils/fashionImages";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Reviews state
  const [reviewsData, setReviewsData] = useState<{ reviews: any[], averageRating: number, totalRatings: number }>({ reviews: [], averageRating: 0, totalRatings: 0 });
  const [canReviewInfo, setCanReviewInfo] = useState<{ canReview: boolean, reason?: string }>({ canReview: false });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        if (res.success && res.data) {
          const prod = res.data;
          setProduct(prod);
          setSelectedImage(null);
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);

          // Fetch related products (same category)
          const relatedRes = await productApi.getAll({
            category: prod.category?.slug || prod.category?.id,
            limit: 4
          });
          if (relatedRes.success) {
            const relData = relatedRes.data;
            const relArray = Array.isArray(relData) ? relData : (relData?.data || relData?.products || []);
            setRelatedProducts(relArray.filter((p: any) => p.id !== prod.id));
          }
          // Fetch reviews
          const reviewsRes = await reviewApi.getProductReviews(prod.id);
          if (reviewsRes.success) {
            setReviewsData(reviewsRes.data);
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const checkCanReview = async () => {
      if (user && product?.id) {
        try {
          const canReviewRes = await reviewApi.canReview(product.id);
          if (canReviewRes.success) {
            setCanReviewInfo(canReviewRes.data);
          }
        } catch (err) {
          console.error("Error checking review status:", err);
        }
      }
    };
    checkCanReview();
  }, [user, product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: selectedImage || getImageUrl(product.thumbnail || product.imageUrl || product.images?.[0]?.imageUrl || getProductFallbackImage(product.slug || product.id || product.name)),
      size: selectedSize,
      color: selectedColor,
      quantity
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !rating || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await reviewApi.createReview(product.id, { rating, comment });
      if (res.success) {
        toast.success("Review submitted successfully!");
        setComment("");
        setRating(5);
        // Refresh reviews
        const reviewsRes = await reviewApi.getProductReviews(product.id);
        if (reviewsRes.success) setReviewsData(reviewsRes.data);
        // Update canReview info
        setCanReviewInfo({ canReview: false, reason: "You have already reviewed this product." });
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || "Failed to submit review");
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-40 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-4">Product Not Found</h2>
        <Link href="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  const activeImage = selectedImage || getImageUrl(product.thumbnail || product.imageUrl || product.images?.[0]?.imageUrl || getProductFallbackImage(product.slug || product.id || product.name));

  return (
    <div className="py-20 bg-white">
      <Container>
        {/* Breadcrumb */}
        <nav className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-secondary">{product.category?.name || "Uncategorized"}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Product Gallery */}
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-accent/20 rounded-2xl overflow-hidden relative group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                onError={() => setSelectedImage(FASTLAIN_PLACEHOLDER)}
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: any, i: number) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelectedImage(getImageUrl(img.imageUrl || img))}
                    className="relative aspect-square bg-accent/20 rounded-xl overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all"
                  >
                    <Image src={getImageUrl(img.imageUrl || img)} alt={`${product.name} thumbnail ${i + 1}`} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl text-primary font-bold">${Number(product.price || 0).toFixed(2)}</p>
            </div>

            <div className="mb-8 flex items-center gap-3">
              {product.stock > 0 ? (
                <>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">In Stock</span>
                  <span className="text-sm font-bold text-gray-500">Only {product.stock} left</span>
                </>
              ) : (
                <span className="bg-red-100 text-red-700 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">Out of Stock</span>
              )}
            </div>

            <div className="mb-10 p-6 bg-accent/10 rounded-2xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">The Story</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Select Color</h3>
                <div className="flex gap-4">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 border-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${selectedColor === color ? 'border-primary bg-primary/5 text-primary' : 'border-accent/20 text-gray-400 hover:border-primary/50'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-4">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'border-primary text-primary bg-primary/5' : 'border-accent/20 text-gray-400 hover:border-primary/50'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <div className="flex items-center bg-accent/10 rounded-xl px-2 py-2 w-fit opacity-90 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock <= 0}
                  className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >-</button>
                <span className="px-6 font-bold text-secondary">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock <= 0 || quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >+</button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-6 text-lg font-bold"
              >
                {product.stock <= 0 ? "Out of Stock" : "Add to Shopping Bag"}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
          <div className="mt-24">
            <SectionTitle
              title="Complete The Look"
              subtitle="Explore products that pair perfectly with this piece"
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Ratings & Reviews */}
        <div className="mt-24 max-w-4xl mx-auto">
          <SectionTitle
            title="Customer Ratings"
            subtitle="See what others are saying about this product"
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 mt-12">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Summary */}
              <div className="flex flex-col items-center justify-center min-w-[200px] p-8 bg-accent/5 rounded-2xl">
                <p className="text-6xl font-black text-secondary mb-2">{reviewsData.averageRating.toFixed(1)}</p>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className={`w-5 h-5 ${i <= Math.round(reviewsData.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{reviewsData.totalRatings} Ratings</p>
              </div>

              {/* Review Form */}
              <div className="flex-1 w-full">
                {canReviewInfo.canReview ? (
                  <form onSubmit={handleReviewSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4">Write a Review</h4>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setRating(i)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <svg className={`w-8 h-8 ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Comment</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full bg-accent/5 border border-accent/20 rounded-xl p-4 text-sm font-medium text-secondary outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder="Share your experience with this product..."
                        required
                      ></textarea>
                    </div>

                    <Button type="submit" disabled={submittingReview} className="w-full sm:w-auto px-8">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500">
                      {canReviewInfo.reason || (user ? "Only verified buyers can rate this product." : "Please log in and purchase this product to leave a review.")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="mt-12 space-y-6">
              {reviewsData.reviews.length > 0 ? (
                reviewsData.reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {r.user?.firstName?.charAt(0) || r.user?.email?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-secondary">{r.user?.firstName || r.user?.email?.split('@')[0] || "User"}</h5>
                            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                              Verified Buyer
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <svg key={i} className={`w-4 h-4 ${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm pl-13 mt-3">{r.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-accent/5 rounded-2xl border border-dashed border-accent/20">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No ratings yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
