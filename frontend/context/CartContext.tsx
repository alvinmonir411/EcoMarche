"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '@/services/api';
import { useRouter } from 'next/navigation';

export type CartItem = {
  id: string | number;
  productId: string | number;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

type Coupon = {
  code: string;
  discountValue: number;
  type: 'PERCENTAGE' | 'FIXED';
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: any) => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  shipping: number;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  discountAmount: number;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const formatError = (err: string | string[] | undefined): string => {
    if (!err) return "";
    return Array.isArray(err) ? err.join(', ') : err;
  };

  const fetchCart = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setCart([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        // Handle both array response and object-with-items response
        const itemsData = Array.isArray(res.data) ? res.data : (res.data.items || []);
        
        const mappedItems: CartItem[] = itemsData.map((item: any) => ({
          id: item.id || item._id,
          productId: item.productId || item.product?.id || item.product?._id,
          name: item.name || item.product?.name || 'Product',
          price: Number(item.price || item.product?.price || 0),
          image: item.image || item.product?.imageUrl || item.product?.image || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
          size: item.size || item.selectedSize,
          color: item.color || item.selectedColor,
          quantity: Number(item.quantity || 1)
        }));
        setCart(mappedItems);
      } else {
        if (res.error?.includes('Unauthorized') || res.error?.includes('401')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          setCart([]);
        } else {
          setError(formatError(res.error) || "Failed to fetch cart");
        }
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("An error occurred while fetching cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    
    if (typeof window !== 'undefined') {
      const savedCoupon = localStorage.getItem('coupon');
      if (savedCoupon) {
        try {
          setCoupon(JSON.parse(savedCoupon));
        } catch (e) {
          console.error("Failed to parse coupon", e);
        }
      }
    }
  }, [fetchCart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (coupon) {
        localStorage.setItem('coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('coupon');
      }
    }
  }, [coupon]);

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

  const addToCart = async (item: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await cartApi.addItem({
        productId: item.productId || item.id,
        quantity: item.quantity || 1,
        size: item.size || item.selectedSize,
        color: item.color || item.selectedColor
      });

      if (res.success) {
        setSuccessMessage(`${item.name || 'Item'} added to cart!`);
        await fetchCart();
        openCart(); // Auto open cart on add
      } else {
        setError(formatError(res.error) || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      setError("An error occurred while adding item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cartApi.removeItem(id);
      if (res.success) {
        await fetchCart();
      } else {
        setError(formatError(res.error) || "Failed to remove item");
      }
    } catch (err) {
      console.error("Remove from cart error:", err);
      setError("An error occurred while removing item");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string | number, quantity: number) => {
    if (quantity < 1) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await cartApi.updateItem(id, quantity);
      if (res.success) {
        await fetchCart();
      } else {
        setError(formatError(res.error) || "Failed to update quantity");
      }
    } catch (err) {
      console.error("Update quantity error:", err);
      setError("An error occurred while updating quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cartApi.clearCart();
      if (res.success) {
        setCart([]);
        setCoupon(null);
      } else {
        setError(formatError(res.error) || "Failed to clear cart");
      }
    } catch (err) {
      console.error("Clear cart error:", err);
      setError("An error occurred while clearing cart");
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = (coupon: Coupon) => {
    setCoupon(coupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const totalItems = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
  }

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const totalPrice = subtotal - discountAmount + shipping;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice,
      subtotal,
      shipping,
      coupon,
      applyCoupon,
      removeCoupon,
      discountAmount,
      isLoading,
      error,
      successMessage,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
