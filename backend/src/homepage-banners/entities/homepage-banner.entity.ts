import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum BannerType {
  HERO_SLIDE = "hero_slide",
  PROMO_BANNER = "promo_banner",
  MIDDLE_BANNER = "middle_banner",
}

@Entity("homepage_banners")
export class HomepageBanner {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    default: BannerType.HERO_SLIDE,
  })
  type: BannerType;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string; // Used as subtitle for hero slide, or eyebrow for promo/middle banner

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
