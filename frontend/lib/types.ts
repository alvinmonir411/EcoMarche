export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  size: string;
  color: string;
  stock: number;
  imageUrl: string;
  galleryImages: string[];
  rating: number;
  reviewCount: number;
  material: string;
  deliveryInfo: string;
  returnInfo: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};
