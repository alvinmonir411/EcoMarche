import { BannerType, CouponType, HomepageSectionType, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { config } from "dotenv";
import { getPrisma } from "../lib/prisma";

config({ path: ".env.local" });
config();

const prisma = getPrisma();

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

async function main() {
  const adminPassword = await hash("Admin@12345", 12);
  const customerPassword = await hash("Customer@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecomarche.test" },
    update: { role: UserRole.ADMIN, isActive: true },
    create: {
      name: "EcoMarche Admin",
      email: "admin@ecomarche.test",
      password: adminPassword,
      role: UserRole.ADMIN,
      phone: "+8801700000000",
      adminProfile: {
        create: {
          permissions: {
            products: true,
            orders: true,
            settings: true,
            customers: true,
          },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@ecomarche.test" },
    update: { isActive: true },
    create: {
      name: "EcoMarche Customer",
      email: "customer@ecomarche.test",
      password: customerPassword,
      role: UserRole.USER,
      phone: "+8801711111111",
    },
  });

  const categories = await Promise.all(
    [
      ["Women Dress", "women-dress", "Elegant dresses for daily and occasion wear."],
      ["Men Clothing", "men-clothing", "Clean, comfortable essentials for men."],
      ["Accessories", "accessories", "Bags, jewelry, and finishing pieces."],
      ["Winter Wear", "winter-wear", "Layering pieces for cooler days."],
      ["Saree", "saree", "Festive and everyday saree collections."],
      ["Kurti", "kurti", "Modern kurtis and ethnic dailywear."],
      ["Kids Dress", "kids-dress", "Soft, durable clothing for children."],
      ["Home Essentials", "home-essentials", "Curated eco-friendly home goods."],
    ].map(([name, slug, description], sortOrder) =>
      prisma.category.upsert({
        where: { slug },
        update: { name, description, sortOrder, isActive: true },
        create: { name, slug, description, sortOrder, isActive: true },
      }),
    ),
  );

  const categoryBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  await Promise.all(
    [
      ["Midi Dresses", "midi-dresses", "women-dress"],
      ["Casual Shirts", "casual-shirts", "men-clothing"],
      ["Handbags", "handbags", "accessories"],
      ["Organic Knits", "organic-knits", "winter-wear"],
      ["Cotton Kurti", "cotton-kurti", "kurti"],
    ].map(([name, slug, categorySlug], sortOrder) =>
      prisma.subCategory.upsert({
        where: { slug },
        update: { name, sortOrder, categoryId: categoryBySlug[categorySlug].id, isActive: true },
        create: { name, slug, sortOrder, categoryId: categoryBySlug[categorySlug].id, isActive: true },
      }),
    ),
  );

  const brands = await Promise.all(
    [
      ["EcoWeave", "ecoweave", "Sustainable fabrics with premium finishing."],
      ["Pure Loom", "pure-loom", "Classic woven styles for the everyday wardrobe."],
      ["NaturaFit", "naturafit", "Active comfort and breathable materials."],
      ["Urban Leaf", "urban-leaf", "Modern city essentials with eco-minded production."],
    ].map(([name, slug, description]) =>
      prisma.brand.upsert({
        where: { slug },
        update: { name, description, isActive: true },
        create: { name, slug, description, isActive: true },
      }),
    ),
  );

  const brandBySlug = Object.fromEntries(brands.map((brand) => [brand.slug, brand]));

  const products = [
    {
      title: "Rose Organic Midi Dress",
      slug: "rose-organic-midi-dress",
      categorySlug: "women-dress",
      brandSlug: "ecoweave",
      price: 82,
      salePrice: 68,
      stock: 36,
      flags: { featured: true, flashSale: true, newArrival: true, justForYou: true },
      thumbnail: image("photo-1515372039744-b8f02a3ae446"),
    },
    {
      title: "Black Minimal Evening Dress",
      slug: "black-minimal-evening-dress",
      categorySlug: "women-dress",
      brandSlug: "pure-loom",
      price: 96,
      salePrice: 84,
      stock: 20,
      flags: { bestSelling: true, trending: true },
      thumbnail: image("photo-1496747611176-843222e1e57c"),
    },
    {
      title: "Cotton Kurti Comfort Set",
      slug: "cotton-kurti-comfort-set",
      categorySlug: "kurti",
      brandSlug: "ecoweave",
      price: 58,
      salePrice: 49,
      stock: 44,
      flags: { featured: true, justForYou: true },
      thumbnail: image("photo-1583391733956-6c78276477e2"),
    },
    {
      title: "Festive Silk Blend Saree",
      slug: "festive-silk-blend-saree",
      categorySlug: "saree",
      brandSlug: "pure-loom",
      price: 140,
      salePrice: 119,
      stock: 16,
      flags: { bestSelling: true, featured: true },
      thumbnail: image("photo-1610030469983-98e550d6193c"),
    },
    {
      title: "Urban Linen Shirt",
      slug: "urban-linen-shirt",
      categorySlug: "men-clothing",
      brandSlug: "urban-leaf",
      price: 54,
      salePrice: 45,
      stock: 52,
      flags: { newArrival: true, trending: true },
      thumbnail: image("photo-1506629905607-d9a297d33cd5"),
    },
    {
      title: "Soft Knit Winter Cardigan",
      slug: "soft-knit-winter-cardigan",
      categorySlug: "winter-wear",
      brandSlug: "naturafit",
      price: 78,
      salePrice: 66,
      stock: 27,
      flags: { flashSale: true, bestSelling: true },
      thumbnail: image("photo-1556821840-3a63f95609a7"),
    },
    {
      title: "Structured Vegan Handbag",
      slug: "structured-vegan-handbag",
      categorySlug: "accessories",
      brandSlug: "urban-leaf",
      price: 72,
      salePrice: 62,
      stock: 31,
      flags: { trending: true, justForYou: true },
      thumbnail: image("photo-1590874103328-eac38a683ce7"),
    },
    {
      title: "Kids Everyday Cotton Dress",
      slug: "kids-everyday-cotton-dress",
      categorySlug: "kids-dress",
      brandSlug: "ecoweave",
      price: 42,
      salePrice: 35,
      stock: 48,
      flags: { newArrival: true, justForYou: true },
      thumbnail: image("photo-1519238263530-99bdd11df2ea"),
    },
    {
      title: "Bamboo Bath Towel Set",
      slug: "bamboo-bath-towel-set",
      categorySlug: "home-essentials",
      brandSlug: "naturafit",
      price: 38,
      salePrice: 31,
      stock: 60,
      flags: { featured: true },
      thumbnail: image("photo-1600369672770-985fd30004eb"),
    },
    {
      title: "Premium Organic Hoodie",
      slug: "premium-organic-hoodie",
      categorySlug: "winter-wear",
      brandSlug: "urban-leaf",
      price: 88,
      salePrice: 74,
      stock: 24,
      flags: { flashSale: true, trending: true, bestSelling: true },
      thumbnail: image("photo-1556821840-3a63f95609a7"),
    },
  ];

  const seededProducts = [];

  for (const [index, product] of products.entries()) {
    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description:
          "Premium EcoMarche marketplace product made with thoughtful materials, reliable finishing, and everyday comfort.",
        shortDescription: "Premium sustainable marketplace pick.",
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        thumbnail: product.thumbnail,
        categoryId: categoryBySlug[product.categorySlug].id,
        brandId: brandBySlug[product.brandSlug].id,
        sku: `ECO-${String(index + 1).padStart(4, "0")}`,
        active: true,
        featured: Boolean(product.flags.featured),
        flashSale: Boolean(product.flags.flashSale),
        newArrival: Boolean(product.flags.newArrival),
        trending: Boolean(product.flags.trending),
        bestSelling: Boolean(product.flags.bestSelling),
        justForYou: Boolean(product.flags.justForYou),
        seoTitle: `${product.title} | EcoMarche`,
        seoDescription: `Shop ${product.title} at EcoMarche with COD and fast delivery support.`,
      },
      create: {
        title: product.title,
        slug: product.slug,
        description:
          "Premium EcoMarche marketplace product made with thoughtful materials, reliable finishing, and everyday comfort.",
        shortDescription: "Premium sustainable marketplace pick.",
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        thumbnail: product.thumbnail,
        categoryId: categoryBySlug[product.categorySlug].id,
        brandId: brandBySlug[product.brandSlug].id,
        sku: `ECO-${String(index + 1).padStart(4, "0")}`,
        active: true,
        featured: Boolean(product.flags.featured),
        flashSale: Boolean(product.flags.flashSale),
        newArrival: Boolean(product.flags.newArrival),
        trending: Boolean(product.flags.trending),
        bestSelling: Boolean(product.flags.bestSelling),
        justForYou: Boolean(product.flags.justForYou),
        seoTitle: `${product.title} | EcoMarche`,
        seoDescription: `Shop ${product.title} at EcoMarche with COD and fast delivery support.`,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: savedProduct.id } });
    await prisma.productImage.createMany({
      data: [
        { productId: savedProduct.id, imageUrl: product.thumbnail, displayOrder: 0, altText: product.title },
        { productId: savedProduct.id, imageUrl: image("photo-1524504388940-b1c1722653e1"), displayOrder: 1, altText: product.title },
      ],
    });

    await prisma.productVariant.deleteMany({ where: { productId: savedProduct.id } });
    await prisma.productVariant.createMany({
      data: ["S", "M", "L", "XL"].map((size, sizeIndex) => ({
        productId: savedProduct.id,
        size,
        color: ["Forest", "Ivory", "Black", "Rose"][sizeIndex],
        stock: Math.max(3, product.stock - sizeIndex * 4),
        price: product.salePrice,
        sku: `${savedProduct.sku}-${size}`,
      })),
    });

    seededProducts.push(savedProduct);
  }

  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        type: BannerType.HERO_SLIDE,
        title: "EcoMarche Premium Marketplace",
        subtitle: "Fresh fashion, home essentials, trusted vendors, and fast COD delivery.",
        imageUrl: image("photo-1490481651871-ab68de25d43d"),
        link: "/shop",
        displayOrder: 1,
      },
      {
        type: BannerType.HERO_SLIDE,
        title: "Flash Sale Picks",
        subtitle: "Limited-time deals curated for the modern Bangladesh shopper.",
        imageUrl: image("photo-1445205170230-053b83016050"),
        link: "/shop?sort=popular",
        displayOrder: 2,
      },
      {
        type: BannerType.PROMO_BANNER,
        title: "Accessories Edit",
        subtitle: "Premium add-ons",
        imageUrl: image("photo-1590874103328-eac38a683ce7"),
        link: "/shop?category=accessories",
        displayOrder: 1,
      },
      {
        type: BannerType.PROMO_BANNER,
        title: "Sustainable Essentials",
        subtitle: "New arrivals",
        imageUrl: image("photo-1489987707025-afc232f7ea0f"),
        link: "/shop?sort=latest",
        displayOrder: 2,
      },
      {
        type: BannerType.MIDDLE_BANNER,
        title: "Deal of the Day: Conscious Comfort",
        subtitle: "Today only",
        imageUrl: image("photo-1523381210434-271e8be1f52b"),
        link: "/shop?sort=popular",
        displayOrder: 1,
      },
    ],
  });

  await prisma.homepageSectionProduct.deleteMany({});
  await prisma.homepageSection.deleteMany({});

  const sectionDefinitions = [
    ["Flash Sale", "flash-sale", HomepageSectionType.FLASH_SALE, ["rose-organic-midi-dress", "soft-knit-winter-cardigan", "premium-organic-hoodie"]],
    ["Just For You", "just-for-you", HomepageSectionType.JUST_FOR_YOU, ["cotton-kurti-comfort-set", "structured-vegan-handbag", "kids-everyday-cotton-dress"]],
    ["Best Selling Products", "best-selling-products", HomepageSectionType.BEST_SELLING, ["black-minimal-evening-dress", "festive-silk-blend-saree", "premium-organic-hoodie"]],
    ["New Arrivals", "new-arrivals", HomepageSectionType.NEW_ARRIVAL, ["urban-linen-shirt", "kids-everyday-cotton-dress", "rose-organic-midi-dress"]],
    ["Trending Products", "trending-products", HomepageSectionType.TRENDING, ["structured-vegan-handbag", "black-minimal-evening-dress", "urban-linen-shirt"]],
  ] as const;

  const productBySlug = Object.fromEntries(seededProducts.map((product) => [product.slug, product]));

  for (const [displayOrder, [title, slug, type, productSlugs]] of sectionDefinitions.entries()) {
    const section = await prisma.homepageSection.create({
      data: {
        title,
        slug,
        type,
        displayOrder: displayOrder + 1,
        enabled: true,
      },
    });

    await prisma.homepageSectionProduct.createMany({
      data: productSlugs
        .map((productSlug, index) => productBySlug[productSlug] && {
          sectionId: section.id,
          productId: productBySlug[productSlug].id,
          displayOrder: index + 1,
        })
        .filter(Boolean) as Array<{ sectionId: string; productId: string; displayOrder: number }>,
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: { active: true, discountValue: 10, type: CouponType.PERCENTAGE },
    create: {
      code: "WELCOME10",
      type: CouponType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 50,
      maxDiscount: 25,
      maxUsage: 500,
      active: true,
    },
  });

  await prisma.deliverySetting.upsert({
    where: { id: "default-delivery" },
    update: {
      name: "Bangladesh standard delivery",
      insideDhaka: 70,
      outsideDhaka: 130,
      freeShippingOver: 150,
      codEnabled: true,
      active: true,
    },
    create: {
      id: "default-delivery",
      name: "Bangladesh standard delivery",
      insideDhaka: 70,
      outsideDhaka: 130,
      freeShippingOver: 150,
      codEnabled: true,
      active: true,
    },
  });

  await prisma.websiteSetting.upsert({
    where: { key: "site" },
    update: {
      value: {
        brandName: "EcoMarche",
        supportEmail: "support@ecomarche.com",
        currency: "USD",
      },
      themeColor: "#163020",
      seoTitle: "EcoMarche | Premium Multi-vendor Marketplace",
      seoDescription: "Shop EcoMarche for premium fashion, essentials, COD delivery, and trusted marketplace deals.",
    },
    create: {
      key: "site",
      value: {
        brandName: "EcoMarche",
        supportEmail: "support@ecomarche.com",
        currency: "USD",
      },
      themeColor: "#163020",
      seoTitle: "EcoMarche | Premium Multi-vendor Marketplace",
      seoDescription: "Shop EcoMarche for premium fashion, essentials, COD delivery, and trusted marketplace deals.",
    },
  });

  console.log(`Seeded EcoMarche with admin ${admin.email} and ${seededProducts.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
