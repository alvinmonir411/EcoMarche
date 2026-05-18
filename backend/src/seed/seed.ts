import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { DataSource, Repository } from "typeorm";
import { Address } from "../addresses/address.entity";
import { CartItem } from "../carts/cart-item.entity";
import { Cart } from "../carts/cart.entity";
import { Category } from "../categories/category.entity";
import { Coupon } from "../coupons/coupon.entity";
import { UserRole } from "../common/enums/user-role.enum";
import { OrderItem } from "../orders/order-item.entity";
import { Order } from "../orders/order.entity";
import { Payment } from "../payments/payment.entity";
import { ProductImage } from "../products/product-image.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { Wishlist } from "../wishlists/wishlist.entity";

dotenv.config();

const seedDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    Address,
    Cart,
    CartItem,
    Category,
    Coupon,
    Order,
    OrderItem,
    Payment,
    Product,
    ProductImage,
    User,
    Wishlist,
  ],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
});

const categories = [
  { name: "Women Dress", slug: "women-dress" },
  { name: "Men Clothing", slug: "men-clothing" },
  { name: "Kids Dress", slug: "kids-dress" },
  { name: "Saree", slug: "saree" },
  { name: "Kurti", slug: "kurti" },
  { name: "T-Shirt", slug: "t-shirt" },
  { name: "Winter Wear", slug: "winter-wear" },
  { name: "Accessories", slug: "accessories" },
];

const products = [
  {
    name: "Floral Summer Dress",
    slug: "floral-summer-dress",
    description: "Light and comfortable floral dress for everyday outings.",
    price: 2450,
    discountPrice: 2190,
    stock: 30,
    size: "S, M, L, XL",
    color: "Pink, White",
    thumbnail: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446",
    categorySlug: "women-dress",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    ],
  },
  {
    name: "Classic Cotton Kurti",
    slug: "classic-cotton-kurti",
    description: "Soft cotton kurti with a clean casual look.",
    price: 1350,
    discountPrice: 1190,
    stock: 45,
    size: "M, L, XL, XXL",
    color: "Blue, Green, Maroon",
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
    categorySlug: "kurti",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2",
    ],
  },
  {
    name: "Elegant Silk Saree",
    slug: "elegant-silk-saree",
    description: "Elegant silk saree for weddings, parties, and festivals.",
    price: 5200,
    discountPrice: 4790,
    stock: 18,
    size: "Free Size",
    color: "Red, Gold",
    thumbnail: "https://images.unsplash.com/photo-1610189010654-9b1b6aaf6f21",
    categorySlug: "saree",
    images: [
      "https://images.unsplash.com/photo-1610189010654-9b1b6aaf6f21",
      "https://images.unsplash.com/photo-1609235449898-95b6a87e0f89",
    ],
  },
  {
    name: "Men Casual Shirt",
    slug: "men-casual-shirt",
    description: "Breathable casual shirt for daily wear.",
    price: 1650,
    discountPrice: 1490,
    stock: 40,
    size: "M, L, XL",
    color: "Black, Navy, White",
    thumbnail: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    categorySlug: "men-clothing",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
    ],
  },
  {
    name: "Graphic Cotton T-Shirt",
    slug: "graphic-cotton-t-shirt",
    description: "Soft graphic t-shirt for a relaxed everyday outfit.",
    price: 850,
    discountPrice: 750,
    stock: 70,
    size: "S, M, L, XL",
    color: "White, Black, Gray",
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    categorySlug: "t-shirt",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
    ],
  },
  {
    name: "Kids Party Dress",
    slug: "kids-party-dress",
    description: "Colorful party dress for kids with a comfortable fit.",
    price: 1850,
    discountPrice: 1690,
    stock: 25,
    size: "2Y, 4Y, 6Y, 8Y",
    color: "Yellow, Pink",
    thumbnail: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    categorySlug: "kids-dress",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4",
    ],
  },
  {
    name: "Warm Winter Hoodie",
    slug: "warm-winter-hoodie",
    description: "Warm hoodie for cool weather and casual layering.",
    price: 2200,
    discountPrice: 1990,
    stock: 35,
    size: "M, L, XL, XXL",
    color: "Brown, Black, Olive",
    thumbnail: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    categorySlug: "winter-wear",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2",
    ],
  },
  {
    name: "Fashion Handbag",
    slug: "fashion-handbag",
    description: "Stylish handbag to complete your everyday outfit.",
    price: 1750,
    discountPrice: 1590,
    stock: 28,
    size: "Medium",
    color: "Tan, Black",
    thumbnail: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
    categorySlug: "accessories",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
    ],
  },
];

async function seedUsers(usersRepository: Repository<User>) {
  // Delete previous users if they exist
  await usersRepository.delete({ email: "admin@ecomarche.com" });
  await usersRepository.delete({ email: "user@ecomarche.com" });
  
  const password = await bcrypt.hash("pass13663", 10);

  await createUserIfMissing(usersRepository, {
    name: "EcoMarche Admin",
    email: "admin@gmail.com",
    password,
    phone: "01700000001",
    role: UserRole.ADMIN,
  });
}

async function createUserIfMissing(
  usersRepository: Repository<User>,
  userData: Partial<User>,
) {
  const existingUser = await usersRepository.findOne({
    where: { email: userData.email },
  });

  if (existingUser) {
    return existingUser;
  }

  const user = usersRepository.create(userData);
  return usersRepository.save(user);
}

async function seedCategories(categoriesRepository: Repository<Category>) {
  for (const categoryData of categories) {
    const existingCategory = await categoriesRepository.findOne({
      where: { slug: categoryData.slug },
    });

    if (!existingCategory) {
      await categoriesRepository.save(categoriesRepository.create(categoryData));
    }
  }
}

async function seedProducts(
  productsRepository: Repository<Product>,
  categoriesRepository: Repository<Category>,
) {
  for (const productData of products) {
    const existingProduct = await productsRepository.findOne({
      where: { slug: productData.slug },
    });

    if (existingProduct) {
      continue;
    }

    const category = await categoriesRepository.findOne({
      where: { slug: productData.categorySlug },
    });

    if (!category) {
      continue;
    }

    const product = productsRepository.create({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      price: productData.price,
      discountPrice: productData.discountPrice,
      stock: productData.stock,
      size: productData.size,
      color: productData.color,
      thumbnail: productData.thumbnail,
      category,
      images: productData.images.map((imageUrl) => ({ imageUrl }) as ProductImage),
    });

    await productsRepository.save(product);
  }
}

async function runSeed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }

  await seedDataSource.initialize();

  const usersRepository = seedDataSource.getRepository(User);
  const categoriesRepository = seedDataSource.getRepository(Category);
  const productsRepository = seedDataSource.getRepository(Product);

  await seedUsers(usersRepository);
  await seedCategories(categoriesRepository);
  await seedProducts(productsRepository, categoriesRepository);

  await seedDataSource.destroy();
  console.log("Seed data created successfully");
}

runSeed().catch(async (error) => {
  console.error("Seed failed", error);

  if (seedDataSource.isInitialized) {
    await seedDataSource.destroy();
  }

  process.exit(1);
});
