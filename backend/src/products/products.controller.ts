import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { MAX_GALLERY_IMAGES } from "../common/constants/upload.constants";
import { productImageUploadOptions } from "../common/helpers/upload.helper";
import { CreateProductDto } from "./dto/create-product.dto";
import { FindProductsQueryDto } from "./dto/find-products-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get("category/:categoryId")
  findByCategory(@Param("categoryId") categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(":id/thumbnail")
  @UseInterceptors(FileInterceptor("thumbnail", productImageUploadOptions))
  @ApiOperation({ summary: "Upload product thumbnail image" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        thumbnail: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  uploadThumbnail(
    @Param("id") id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.uploadThumbnail(id, file);
  }

  @Post(":id/gallery")
  @UseInterceptors(
    FilesInterceptor("images", MAX_GALLERY_IMAGES, productImageUploadOptions),
  )
  @ApiOperation({ summary: "Upload product gallery images" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  uploadGalleryImages(
    @Param("id") id: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productsService.uploadGalleryImages(id, files);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }
}
