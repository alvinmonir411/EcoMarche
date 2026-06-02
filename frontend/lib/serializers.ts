import type {
  Banner,
  Brand,
  Category,
  Coupon,
  DeliverySetting,
  HomepageSection,
  HomepageSectionProduct,
  Order,
  OrderItem,
  Payment,
  Product,
  ProductImage,
  ProductVariant,
  SubCategory,
  User,
  WebsiteSetting,
} from "@prisma/client";

type ProductWithRelations = Product & {
  category?: Category | null;
  subCategory?: SubCategory | null;
  brand?: Brand | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
};

type OrderWithRelations = Order & {
  user?: Pick<User, "id" | "name" | "email"> | null;
  items?: OrderItem[];
  payment?: Payment | null;
};

type SectionWithProducts = HomepageSection & {
  sectionProducts?: Array<HomepageSectionProduct & { product: ProductWithRelations }>;
};

const money = (value: unknown) => Number(value ?? 0);

const lower = (value: string) => value.toLowerCase();

export function serializeCategory(category: Category & { products?: Product[]; subCategories?: SubCategory[] }) {
  return {
    ...category,
    productCount: category.products?.length ?? 0,
    products: category.products ?? [],
    subCategories: category.subCategories ?? [],
  };
}

export function serializeSubCategory(subCategory: SubCategory & { category?: Category | null; products?: Product[] }) {
  return {
    ...subCategory,
    productCount: subCategory.products?.length ?? 0,
  };
}

export function serializeBrand(brand: Brand & { products?: Product[] }) {
  return {
    ...brand,
    productCount: brand.products?.length ?? 0,
  };
}

export function serializeProduct(product: ProductWithRelations) {
  const imageUrl =
    product.thumbnail ||
    product.images?.sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl ||
    "";

  const salePrice = product.salePrice ? money(product.salePrice) : undefined;
  const price = money(product.price);
  const variants = product.variants ?? [];
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean)));
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));

  return {
    ...product,
    name: product.title,
    price,
    salePrice,
    discountPrice: salePrice,
    imageUrl,
    image: imageUrl,
    thumbnail: product.thumbnail || imageUrl,
    galleryImages: product.images?.map((image) => image.imageUrl) ?? (imageUrl ? [imageUrl] : []),
    images: product.images ?? [],
    variants: variants.map((variant) => ({
      ...variant,
      price: variant.price ? money(variant.price) : undefined,
    })),
    sizes,
    colors,
    category: product.category,
    subCategory: product.subCategory,
    brand: product.brand,
    isNew: product.newArrival,
    featured: product.featured,
    flashSale: product.flashSale,
    newArrival: product.newArrival,
    trending: product.trending,
    bestSelling: product.bestSelling,
    justForYou: product.justForYou,
  };
}

export function serializeCartItem(item: {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  product: ProductWithRelations;
}) {
  const product = serializeProduct(item.product);
  const price = product.discountPrice ?? product.price;

  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
    size: item.selectedSize,
    color: item.selectedColor,
    name: product.name,
    slug: product.slug,
    image: product.imageUrl,
    price,
    product,
  };
}

export function serializeWishlistItem(item: { id: string; productId: string; product: ProductWithRelations }) {
  const product = serializeProduct(item.product);

  return {
    id: item.id,
    productId: item.productId,
    name: product.name,
    price: product.discountPrice ?? product.price,
    image: product.imageUrl,
    slug: product.slug,
    category: product.category?.name,
    product,
  };
}

export function serializeOrder(order: OrderWithRelations) {
  const status = order.orderStatus.toUpperCase();
  const orderStatus = lower(order.orderStatus);
  const deliveryStatus = lower(order.deliveryStatus);
  const paymentStatus = lower(order.paymentStatus);

  return {
    ...order,
    subtotal: money(order.subtotal),
    deliveryCharge: money(order.deliveryCharge),
    discount: money(order.discount),
    totalAmount: money(order.totalAmount),
    total: money(order.totalAmount),
    status,
    orderStatus,
    deliveryStatus,
    paymentStatus,
    paymentMethod: lower(order.paymentMethod),
    user: order.user,
    items: order.items?.map((item) => ({
      ...item,
      price: money(item.price),
      total: money(item.total),
      name: item.productTitle,
      image: item.productImage,
    })) ?? [],
    payment: order.payment
      ? {
          ...order.payment,
          amount: money(order.payment.amount),
          status: lower(order.payment.status),
          method: lower(order.payment.method),
        }
      : null,
  };
}

export function serializeCoupon(coupon: Coupon) {
  return {
    ...coupon,
    discountValue: money(coupon.discountValue),
    minOrderValue: coupon.minOrderValue ? money(coupon.minOrderValue) : null,
    maxDiscount: coupon.maxDiscount ? money(coupon.maxDiscount) : null,
  };
}

export function serializeBanner(banner: Banner) {
  return {
    ...banner,
    type: lower(banner.type),
  };
}

export function serializeHomepageSection(section: SectionWithProducts) {
  return {
    ...section,
    type: lower(section.type),
    sectionProducts:
      section.sectionProducts
        ?.filter((sp: any) => sp.product)
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map((sectionProduct) => ({
          ...sectionProduct,
          product: serializeProduct(sectionProduct.product),
        })) ?? [],
  };
}

export function serializeWebsiteSetting(setting: WebsiteSetting) {
  return setting;
}

export function serializeDeliverySetting(setting: DeliverySetting) {
  return {
    ...setting,
    insideDhaka: money(setting.insideDhaka),
    outsideDhaka: money(setting.outsideDhaka),
    freeShippingOver: setting.freeShippingOver ? money(setting.freeShippingOver) : null,
  };
}
