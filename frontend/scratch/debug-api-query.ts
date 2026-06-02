import { config } from "dotenv";
config({ path: ".env.local" });
import { getPrisma } from "../lib/prisma";

async function main() {
  const prisma = getPrisma();
  
  // Let's run a raw query or findMany with empty where
  const allProds = await prisma.product.findMany({});
  console.log("All products length (raw findMany):", allProds.length);

  const where: any = {};
  // Let's see what is inside the prisma client
  const include = {
    category: true,
    subCategory: true,
    brand: true,
    images: { orderBy: { displayOrder: "asc" as any } },
    variants: { orderBy: { createdAt: "asc" as any } },
  };

  const products = await prisma.product.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" }
  });

  console.log("Products from debug-api-query count:", products.length);
  for (const p of products) {
    console.log(`- ${p.title} (active: ${p.active})`);
  }
}

main().catch(console.error);
