import { config } from "dotenv";
config({ path: ".env.local" });
import { getPrisma } from "../lib/prisma";

async function main() {
  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true }
  });
  console.log("Total Products in DB:", products.length);
  console.log("Products in DB:", products);

  const sections = await prisma.homepageSection.findMany({
    include: {
      sectionProducts: {
        include: {
          product: {
            select: { id: true, title: true }
          }
        }
      }
    }
  });
  console.log("Total Homepage Sections in DB:", sections.length);
  for (const sec of sections) {
    console.log(`Section: ${sec.title} (${sec.slug}) - Products count: ${sec.sectionProducts.length}`);
    for (const sp of sec.sectionProducts) {
      console.log(`  - ${sp.product?.title}`);
    }
  }
}

main().catch(console.error);
