import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HomepageBanner, BannerType } from "./entities/homepage-banner.entity";
import { CreateHomepageBannerDto } from "./dto/create-homepage-banner.dto";
import { UpdateHomepageBannerDto } from "./dto/update-homepage-banner.dto";

@Injectable()
export class HomepageBannersService implements OnModuleInit {
  constructor(
    @InjectRepository(HomepageBanner)
    private readonly bannerRepository: Repository<HomepageBanner>,
  ) {}

  async onModuleInit() {
    console.log("OnModuleInit: Checking if homepage banners need seeding...");
    const count = await this.bannerRepository.count();
    if (count === 0) {
      console.log("OnModuleInit: Seeding homepage banners...");
      const defaultBanners = [
        // Hero Slides
        {
          type: BannerType.HERO_SLIDE,
          title: "The New Standard",
          subtitle: "Minimal silhouettes and premium materials curated for the modern individual.",
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=88",
          link: "/shop",
          displayOrder: 1,
        },
        {
          type: BannerType.HERO_SLIDE,
          title: "Summer Relaxed",
          subtitle: "Lightweight fabrics, breathable weaves, and relaxed modern tailoring.",
          imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88",
          link: "/shop?category=women-dress",
          displayOrder: 2,
        },
        {
          type: BannerType.HERO_SLIDE,
          title: "Luxury Everyday",
          subtitle: "Timeless investment pieces crafted with meticulous detail and eco-conscious care.",
          imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1400&q=88",
          link: "/shop?category=men-clothing",
          displayOrder: 3,
        },
        {
          type: BannerType.HERO_SLIDE,
          title: "Sustainable Knits",
          subtitle: "Luxurious organic cashmere sweaters and heavy-weight wool coats for cold seasons.",
          imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
          link: "/shop?category=winter-wear",
          displayOrder: 4,
        },
        // Promo Banners
        {
          type: BannerType.PROMO_BANNER,
          title: "Accessories Edit",
          subtitle: "Accessories Collection",
          imageUrl: "https://images.unsplash.com/photo-1506629905607-d9a297d84d30?auto=format&fit=crop&w=1200&q=88",
          link: "/shop?category=accessories",
          displayOrder: 1,
        },
        {
          type: BannerType.PROMO_BANNER,
          title: "Denim & Essentials",
          subtitle: "New Arrivals",
          imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=88",
          link: "/shop?category=essentials",
          displayOrder: 2,
        },
        // Middle Premium Banner
        {
          type: BannerType.MIDDLE_BANNER,
          title: "Soft Tailoring For Everyday Elegance",
          subtitle: "Premium Drop",
          imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=88",
          link: "/shop",
          displayOrder: 1,
        },
      ];

      for (const b of defaultBanners) {
        await this.bannerRepository.save(this.bannerRepository.create({ ...b, enabled: true }));
      }
      console.log("OnModuleInit: Seeded default homepage banners.");
    }
  }

  async findAll(onlyEnabled = false): Promise<HomepageBanner[]> {
    const where: any = {};
    if (onlyEnabled) {
      where.enabled = true;
    }
    return this.bannerRepository.find({
      where,
      order: { displayOrder: "ASC" },
    });
  }

  async findOne(id: string): Promise<HomepageBanner> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Homepage banner with ID "${id}" not found`);
    }
    return banner;
  }

  async create(dto: CreateHomepageBannerDto): Promise<HomepageBanner> {
    const maxOrderBanner = await this.bannerRepository.findOne({
      where: { type: dto.type },
      order: { displayOrder: "DESC" },
    });
    const nextOrder = maxOrderBanner ? maxOrderBanner.displayOrder + 1 : 1;

    const banner = this.bannerRepository.create({
      ...dto,
      displayOrder: dto.displayOrder ?? nextOrder,
    });
    return this.bannerRepository.save(banner);
  }

  async update(id: string, dto: UpdateHomepageBannerDto): Promise<HomepageBanner> {
    const banner = await this.findOne(id);
    Object.assign(banner, dto);
    return this.bannerRepository.save(banner);
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }

  async reorder(bannerIds: string[]): Promise<void> {
    for (let i = 0; i < bannerIds.length; i++) {
      const id = bannerIds[i];
      await this.bannerRepository.update(id, { displayOrder: i + 1 });
    }
  }
}
