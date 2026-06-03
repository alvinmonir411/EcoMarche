import { Prisma } from "@prisma/client";
import { z } from "zod";
import { created, fail, ok, readJson, slugify, toNumber } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().min(1),
  shortDescription: z.string().optional().nullable(),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  flashSale: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  trending: z.boolean().optional(),
  bestSelling: z.boolean().optional(),
  justForYou: z.boolean().optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

const include = {
  category: true,
  subCategory: true,
  brand: true,
  images: { orderBy: { displayOrder: "asc" as const } },
  variants: { orderBy: { createdAt: "asc" as const } },
};

export async function GET(request: Request) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, toNumber(searchParams.get("page"), 1));
    const limit = Math.min(60, Math.max(1, toNumber(searchParams.get("limit"), 12)));
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "latest";

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = {
        OR: [
          { slug: { equals: category, mode: "insensitive" } },
          { name: { equals: category, mode: "insensitive" } },
        ],
      };
    }

    if (brand && brand !== "all") {
      where.brand = {
        OR: [
          { slug: { equals: brand, mode: "insensitive" } },
          { name: { equals: brand, mode: "insensitive" } },
        ],
      };
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: toNumber(minPrice) } : {}),
        ...(maxPrice ? { lte: toNumber(maxPrice) } : {}),
      };
    }

    if (searchParams.get("inStock") === "true") {
      where.stock = { gt: 0 };
    }

    if (searchParams.get("featured") === "true") where.featured = true;
    if (searchParams.get("flashSale") === "true") where.flashSale = true;
    if (searchParams.get("newArrival") === "true") where.newArrival = true;
    if (searchParams.get("trending") === "true") where.trending = true;
    if (searchParams.get("bestSelling") === "true") where.bestSelling = true;
    if (searchParams.get("justForYou") === "true") where.justForYou = true;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : sort === "popular"
            ? { salesCount: "desc" }
            : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const data = products.map(serializeProduct);

    return ok({
      data,
      products: data,
      total,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products list error", error);
    return fail("Failed to load products.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = productSchema.parse(await readJson(request));
    const title = input.title || input.name;

    if (!title) {
      return fail("Product title is required.", 422);
    }

    const prisma = getPrisma();
    const productSlug = input.slug ? slugify(input.slug) : slugify(title);
    const sku = input.sku || `ECO-${Date.now()}`;
    const salePrice = input.salePrice ?? input.discountPrice ?? null;

    const product = await prisma.product.create({
      data: {
        title,
        slug: productSlug,
        description: input.description,
        shortDescription: input.shortDescription ?? undefined,
        price: input.price,
        salePrice,
        stock: input.stock,
        sku,
        categoryId: input.categoryId || undefined,
        subCategoryId: input.subCategoryId || undefined,
        brandId: input.brandId || undefined,
        thumbnail: input.thumbnail || input.imageUrls?.[0],
        featured: input.featured ?? false,
        flashSale: input.flashSale ?? false,
        newArrival: input.newArrival ?? false,
        trending: input.trending ?? false,
        bestSelling: input.bestSelling ?? false,
        justForYou: input.justForYou ?? false,
        active: input.active ?? true,
        status: (input.active ?? true) ? "ACTIVE" : "INACTIVE",
        seoTitle: input.seoTitle ?? `${title} | EcoMarche`,
        seoDescription: input.seoDescription ?? input.shortDescription ?? input.description.slice(0, 155),
        images: {
          create: (input.imageUrls ?? [])
            .filter(Boolean)
            .map((imageUrl, displayOrder) => ({
              imageUrl,
              displayOrder,
              altText: title,
            })),
        },
        variants: {
          create: buildVariants(input.sizes, input.colors, salePrice ?? input.price, input.stock, sku),
        },
      },
      include,
    });

    return created(serializeProduct(product));
  } catch (error) {
    if (error instanceof Response) {
      return fail(error.status === 403 ? "Forbidden" : "Unauthorized", error.status);
    }

    if (error instanceof z.ZodError) {
      return fail("Please provide valid product data.", 422, error.issues);
    }

    console.error("Product create error", error);
    return fail("Failed to create product.", 500);
  }
}

function buildVariants(
  sizes: string[] | undefined,
  colors: string[] | undefined,
  price: number,
  stock: number,
  sku: string,
) {
  const safeSizes = sizes?.filter(Boolean).length ? sizes.filter(Boolean) : ["Default"];
  const safeColors = colors?.filter(Boolean).length ? colors.filter(Boolean) : ["Default"];

  return safeSizes.flatMap((size) =>
    safeColors.map((color) => ({
      size,
      color,
      price,
      stock: Math.max(0, Math.floor(stock / Math.max(1, safeSizes.length * safeColors.length))),
      sku: `${sku}-${slugify(size)}-${slugify(color)}`.toUpperCase(),
    })),
  );
}
