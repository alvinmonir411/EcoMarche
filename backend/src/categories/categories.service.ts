import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  findAll() {
    return this.categoriesRepository.find({
      relations: ["products"],
      order: { name: "ASC" },
    });
  }

  findOne(id: string) {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: ["products"],
    });
  }

  findBySlug(slug: string) {
    return this.categoriesRepository.findOne({
      where: { slug },
      relations: ["products"],
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.categoriesRepository.delete(id);
  }
}
