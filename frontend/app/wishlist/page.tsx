"use client";

import Container from "@/components/ui/Container";
import ProductCard from "@/components/product/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { wishlist, isLoading, error, successMessage } = useWishlist();

  if (isLoading && wishlist.length === 0) {
    return (
      <div className="py-40 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white min-h-screen">
      <Container>
        <SectionTitle 
          title="Your Wishlist" 
          subtitle={wishlist.length > 0 ? `You have ${wishlist.length} items saved` : "Keep track of the pieces you love most"}
          center
        />

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm font-medium text-center">
            {successMessage}
          </div>
        )}

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {wishlist.map((item) => (
              <ProductCard 
                key={item.id} 
                product={{
                  id: Number(item.productId),
                  name: item.name,
                  price: item.price,
                  imageUrl: item.image,
                  category: item.category,
                  slug: item.slug
                }} 
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Your wishlist is empty" 
            message="Save your favorite items here and they will be waiting for you."
            buttonText="Explore Shop"
            buttonHref="/shop"
          />
        )}
      </Container>
    </div>
  );
}
