"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '@/services/api';
import { useRouter } from 'next/navigation';

export type WishlistItem = {
  id: string | number;
  productId: string | number;
  name: string;
  price: number;
  image: string;
  slug: string;
  category?: string;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: string | number) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const formatError = (err: string | string[] | undefined): string => {
    if (!err) return "";
    return Array.isArray(err) ? err.join(', ') : err;
  };

  const fetchWishlist = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setWishlist([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await wishlistApi.getWishlist();
      if (res.success && res.data) {
        const itemsData = Array.isArray(res.data) ? res.data : (res.data.items || []);
        
        const mappedItems: WishlistItem[] = itemsData.map((item: any) => ({
          id: item.id || item._id,
          productId: item.productId || item.product?.id || item.product?._id || item.id,
          name: item.name || item.product?.name || 'Product',
          price: Number(item.price || item.product?.price || 0),
          image: item.image || item.product?.imageUrl || item.product?.image || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
          slug: item.slug || item.product?.slug || "",
          category: item.category || item.product?.category?.name || item.product?.category
        }));
        setWishlist(mappedItems);
      } else {
        if (res.error?.includes('Unauthorized') || res.error?.includes('401')) {
          setWishlist([]);
        } else {
          setError(formatError(res.error) || "Failed to fetch wishlist");
        }
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      setError("An error occurred while fetching wishlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const isInWishlist = (productId: string | number) => {
    return wishlist.some(item => item.productId === productId);
  };

  const addToWishlist = async (product: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    const productId = product.productId || product.id;
    
    // Prevent duplicates in frontend
    if (isInWishlist(productId)) {
      setSuccessMessage("Product is already in your wishlist!");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await wishlistApi.addItem(productId);

      if (res.success) {
        setSuccessMessage(`${product.name || 'Item'} added to wishlist!`);
        await fetchWishlist();
      } else {
        setError(formatError(res.error) || "Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Add to wishlist error:", err);
      setError("An error occurred while adding to wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await wishlistApi.removeItem(productId);
      if (res.success) {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
        setSuccessMessage("Removed from wishlist");
      } else {
        setError(formatError(res.error) || "Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      setError("An error occurred while removing from wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      isLoading,
      error,
      successMessage,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
