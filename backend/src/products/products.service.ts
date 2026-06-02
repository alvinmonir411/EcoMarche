import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../categories/category.entity";
import { getProductImageUrl } from "../common/helpers/upload.helper";
import { CreateProductDto } from "./dto/create-product.dto";
import { FindProductsQueryDto } from "./dto/find-products-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductImage } from "./product-image.entity";
import { Product } from "./product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
  ) {}

  create(createProductDto: CreateProductDto) {
    const { imageUrls = [], categoryId, ...productData } = createProductDto;

    const product = this.productsRepository.create({
      ...productData,
      category: { id: categoryId } as Category,
      images: imageUrls.map((imageUrl) => ({ imageUrl }) as ProductImage),
    });

    return this.productsRepository.save(product);
  }

  async findAll(query: FindProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const productsQuery = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.images", "images")
      .skip(skip)
      .take(limit);

    if (query.search) {
      productsQuery.andWhere("product.name ILIKE :search", {
        search: `%${query.search}%`,
      });
    }

    if (query.category) {
      productsQuery.andWhere(
        "(category.slug = :category OR category.name ILIKE :categoryName)",
        {
          category: query.category,
          categoryName: `%${query.category}%`,
        },
      );
    }

    if (query.categoryId) {
      productsQuery.andWhere("category.id = :categoryId", {
        categoryId: query.categoryId,
      });
    }

    if (query.categorySlug) {
      productsQuery.andWhere("category.slug = :categorySlug", {
        categorySlug: query.categorySlug,
      });
    }

    if (query.size) {
      productsQuery.andWhere("product.sizes LIKE :size", { size: `%${query.size}%` });
    }

    if (query.color) {
      productsQuery.andWhere("product.colors LIKE :color", { color: `%${query.color}%` });
    }

    if (query.minPrice !== undefined) {
      productsQuery.andWhere("product.price >= :minPrice", {
        minPrice: query.minPrice,
      });
    }

    if (query.maxPrice !== undefined) {
      productsQuery.andWhere("product.price <= :maxPrice", {
        maxPrice: query.maxPrice,
      });
    }

    if (query.sort === "price_asc") {
      productsQuery.orderBy("product.price", "ASC");
    } else if (query.sort === "price_desc") {
      productsQuery.orderBy("product.price", "DESC");
    } else {
      productsQuery.orderBy("product.createdAt", "DESC");
    }

    const [products, total] = await productsQuery.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }

  findOne(id: string) {
    return this.productsRepository.findOne({
      where: { id },
      relations: ["category", "images"],
    });
  }

  findBySlug(slug: string) {
    return this.productsRepository.findOne({
      where: { slug },
      relations: ["category", "images"],
    });
  }

  findByCategory(categoryId: string) {
    return this.productsRepository.find({
      where: {
        category: { id: categoryId },
      },
      relations: ["category", "images"],
      order: { createdAt: "DESC" },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { imageUrls, categoryId, ...productData } = updateProductDto;

    await this.productsRepository.update(id, {
      ...productData,
      ...(categoryId ? { category: { id: categoryId } as Category } : {}),
    });

    if (imageUrls) {
      await this.productImagesRepository
        .createQueryBuilder()
        .delete()
        .where("productId = :productId", { productId: id })
        .execute();

      const images = imageUrls.map((imageUrl) =>
        this.productImagesRepository.create({
          imageUrl,
          product: { id } as Product,
        }),
      );

      await this.productImagesRepository.save(images);
    }

    return this.findOne(id);
  }

  remove(id: string) {
    return this.productsRepository.delete(id);
  }

  async uploadThumbnail(id: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Thumbnail image is required");
    }

    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    product.thumbnail = getProductImageUrl(file);

    await this.productsRepository.save(product);
    return this.findOne(id);
  }

  async uploadGalleryImages(id: string, files?: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException("At least one gallery image is required");
    }

    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const images = files.map((file) =>
      this.productImagesRepository.create({
        imageUrl: getProductImageUrl(file),
        product,
      }),
    );

    await this.productImagesRepository.save(images);
    return this.findOne(id);
  }
}
