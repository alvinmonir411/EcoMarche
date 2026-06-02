export const ECOMARCHE_PLACEHOLDER = "/images/ecomarche-placeholder.svg";

export const categoryFashionImages: Record<string, string> = {
  "women-dress": "/images/cat_women.png",
  "men-clothing": "/images/cat_men.png",
  accessories: "/images/cat_accessories.png",
  "winter-wear": "/images/cat_winter.png",
  "t-shirt": "/images/cat_tshirt.png",
  saree: "/images/cat_saree.png",
  kurti: "/images/cat_kurti.png",
  "kids-dress": "/images/cat_kids.png",
};

export const bannerFashionImages = {
  hero: "/images/hero_banner.png",
  editorial: "/images/collection_banner.png",
  women: "/images/cat_women.png",
  men: "/images/cat_men.png",
  accessories: "/images/promo_accessories.png",
  essentials: "/images/promo_essentials.png",
  collection: "/images/collection_banner.png",
};

export const productFashionImages = [
  "/images/prod_jacket.png",
  "/images/prod_handbag.png",
  "/images/prod_hoodie.png",
  "/images/prod_dress.png",
  "/images/cat_women.png",
  "/images/cat_men.png",
  "/images/cat_accessories.png",
  "/images/cat_winter.png",
  "/images/cat_tshirt.png",
  "/images/cat_saree.png",
  "/images/cat_kurti.png",
  "/images/cat_kids.png",
];

export function getProductFallbackImage(seed?: string | number) {
  const text = String(seed ?? "ecomarche");
  const hash = Array.from(text).reduce((total, char) => total + char.charCodeAt(0), 0);
  return productFashionImages[hash % productFashionImages.length] || ECOMARCHE_PLACEHOLDER;
}
