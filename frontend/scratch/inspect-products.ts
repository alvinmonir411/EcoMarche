import { config } from "dotenv";
config({ path: ".env.local" });
import { getPrisma } from "../lib/prisma";

async function main() {
  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      sku: true,
      active: true,
      status: true,
      price: true,
      salePrice: true,
      stock: true,
      categoryId: true
    }
  });
  console.log("All products in DB:");
  for (const p of products) {
    console.log(`- Title: "${p.title}" | SKU: "${p.sku}" | Active: ${p.active} | Status: "${p.status}" | Category ID: "${p.categoryId}"`);
  }
}

main().catch(console.error);
