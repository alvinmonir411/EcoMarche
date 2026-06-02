import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../../products/product.entity";

@Entity("homepage_sections")
export class HomepageSection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 0 })
  displayOrder: number;

  @OneToMany(
    () => HomepageSectionProduct,
    (sectionProduct) => sectionProduct.section,
    { cascade: true }
  )
  sectionProducts: HomepageSectionProduct[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity("homepage_section_products")
export class HomepageSectionProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(
    () => HomepageSection,
    (section) => section.sectionProducts,
    { onDelete: "CASCADE" }
  )
  section: HomepageSection;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  product: Product;

  @Column({ default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
