import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HomepageSection, HomepageSectionProduct } from "./entities/homepage-section.entity";
import { Product } from "../products/product.entity";
import { CreateHomepageSectionDto } from "./dto/create-homepage-section.dto";
import { UpdateHomepageSectionDto } from "./dto/update-homepage-section.dto";

@Injectable()
export class HomepageSectionsService implements OnModuleInit {
  constructor(
    @InjectRepository(HomepageSection)
    private readonly sectionRepository: Repository<HomepageSection>,
    @InjectRepository(HomepageSectionProduct)
    private readonly sectionProductRepository: Repository<HomepageSectionProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    console.log("OnModuleInit: Checking if homepage sections need seeding...");
    const count = await this.sectionRepository.count();
    const relationCount = await this.sectionProductRepository.count();
    
    if (count === 0 || relationCount === 0) {
      console.log("OnModuleInit: Seeding homepage sections with fallback options...");
      const sectionProductRepo = this.sectionProductRepository;
      const sectionRepo = this.sectionRepository;

      // Clear existing mappings and sections to avoid duplicates
      await sectionProductRepo.createQueryBuilder().delete().execute();
      await sectionRepo.createQueryBuilder().delete().execute();

      const defaultSections = [
        { title: "Top Selling Products", slug: "top-selling-products", displayOrder: 1 },
        { title: "All Women Dress", slug: "all-women-dress", displayOrder: 2 },
        { title: "Seasonal Essentials", slug: "seasonal-essentials", displayOrder: 3 },
        { title: "Organic / Sustainable Certified", slug: "organic-sustainable-certified", displayOrder: 4 },
        { title: "Just For You", slug: "just-for-you", displayOrder: 5 },
        { title: "Premium Collection", slug: "premium-collection", displayOrder: 6 },
        { title: "Exclusive Combo Deals", slug: "exclusive-combo-deals", displayOrder: 7 },
      ];

      const dbProducts = await this.productRepository.find();
      if (dbProducts.length > 0) {
        for (const sec of defaultSections) {
          const section = this.sectionRepository.create({
            title: sec.title,
            slug: sec.slug,
            displayOrder: sec.displayOrder,
            enabled: true,
          });
          const savedSection = await this.sectionRepository.save(section);

          let assignedProductSlugs: string[] = [];
          if (sec.slug === "top-selling-products") {
            assignedProductSlugs = ["floral-summer-dress", "classic-cotton-kurti", "men-casual-shirt", "fashion-handbag"];
          } else if (sec.slug === "all-women-dress") {
            assignedProductSlugs = ["floral-summer-dress", "classic-cotton-kurti", "elegant-silk-saree"];
          } else if (sec.slug === "seasonal-essentials") {
            assignedProductSlugs = ["warm-winter-hoodie", "kids-party-dress", "men-casual-shirt"];
          } else if (sec.slug === "organic-sustainable-certified") {
            assignedProductSlugs = ["classic-cotton-kurti", "graphic-cotton-t-shirt", "fashion-handbag"];
          } else if (sec.slug === "just-for-you") {
            assignedProductSlugs = ["floral-summer-dress", "graphic-cotton-t-shirt", "warm-winter-hoodie"];
          } else if (sec.slug === "premium-collection") {
            assignedProductSlugs = ["elegant-silk-saree", "men-casual-shirt", "fashion-handbag"];
          } else if (sec.slug === "exclusive-combo-deals") {
            assignedProductSlugs = ["graphic-cotton-t-shirt", "floral-summer-dress"];
          }

          let order = 0;
          let assignedAny = false;
          for (const slug of assignedProductSlugs) {
            const prod = dbProducts.find((p) => p.slug === slug);
            if (prod) {
              const secProd = this.sectionProductRepository.create({
                section: savedSection,
                product: prod,
                displayOrder: order++,
              });
              await this.sectionProductRepository.save(secProd);
              assignedAny = true;
            }
          }

          // Fallback: If no products were assigned to "top-selling-products", assign the first available db product
          if (!assignedAny && sec.slug === "top-selling-products" && dbProducts.length > 0) {
            const secProd = this.sectionProductRepository.create({
              section: savedSection,
              product: dbProducts[0],
              displayOrder: 0,
            });
            await this.sectionProductRepository.save(secProd);
          }
        }
        console.log("OnModuleInit: Homepage sections seeded successfully!");
      } else {
        console.log("OnModuleInit: No products found to assign to homepage sections.");
      }
    } else {
      console.log("OnModuleInit: Homepage sections already exist with products, skipping seeding.");
    }
  }

  async findAll(onlyEnabled = false): Promise<HomepageSection[]> {
    const queryBuilder = this.sectionRepository
      .createQueryBuilder("section")
      .leftJoinAndSelect("section.sectionProducts", "sectionProduct")
      .leftJoinAndSelect("sectionProduct.product", "product")
      .leftJoinAndSelect("product.category", "category")
      .orderBy("section.displayOrder", "ASC")
      .addOrderBy("sectionProduct.displayOrder", "ASC");

    if (onlyEnabled) {
      queryBuilder.where("section.enabled = :enabled", { enabled: true });
    }

    const sections = await queryBuilder.getMany();

    if (onlyEnabled) {
      // Hide sections with no products on public homepage
      return sections.filter((section) => section.sectionProducts && section.sectionProducts.length > 0);
    }

    return sections;
  }

  async findOne(id: string): Promise<HomepageSection> {
    const section = await this.sectionRepository
      .createQueryBuilder("section")
      .leftJoinAndSelect("section.sectionProducts", "sectionProduct")
      .leftJoinAndSelect("sectionProduct.product", "product")
      .leftJoinAndSelect("product.category", "category")
      .where("section.id = :id", { id })
      .orderBy("sectionProduct.displayOrder", "ASC")
      .getOne();

    if (!section) {
      throw new NotFoundException(`Homepage section with ID "${id}" not found`);
    }

    return section;
  }

  async create(dto: CreateHomepageSectionDto): Promise<HomepageSection> {
    const slug = dto.slug || this.generateSlug(dto.title);
    
    // Find highest displayOrder
    const maxOrderSection = await this.sectionRepository.findOne({
      where: {},
      order: { displayOrder: "DESC" },
    });
    const nextOrder = maxOrderSection ? maxOrderSection.displayOrder + 1 : 0;

    const section = this.sectionRepository.create({
      ...dto,
      slug,
      displayOrder: dto.displayOrder ?? nextOrder,
    });

    return this.sectionRepository.save(section);
  }

  async update(id: string, dto: UpdateHomepageSectionDto): Promise<HomepageSection> {
    const section = await this.findOne(id);

    if (dto.title && !dto.slug) {
      section.slug = this.generateSlug(dto.title);
    }

    Object.assign(section, dto);
    return this.sectionRepository.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionRepository.remove(section);
  }

  async assignProducts(id: string, productIds: string[]): Promise<HomepageSection> {
    const section = await this.findOne(id);

    // Delete existing relations
    await this.sectionProductRepository
      .createQueryBuilder()
      .delete()
      .where("sectionId = :id", { id })
      .execute();

    // Create new relations
    if (productIds && productIds.length > 0) {
      const sectionProducts: HomepageSectionProduct[] = [];
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (product) {
          const sectionProduct = this.sectionProductRepository.create({
            section,
            product,
            displayOrder: i,
          });
          sectionProducts.push(sectionProduct);
        }
      }
      if (sectionProducts.length > 0) {
        await this.sectionProductRepository.save(sectionProducts);
      }
    }

    return this.findOne(id);
  }

  async reorder(sectionIds: string[]): Promise<void> {
    for (let i = 0; i < sectionIds.length; i++) {
      const id = sectionIds[i];
      await this.sectionRepository.update(id, { displayOrder: i });
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}
