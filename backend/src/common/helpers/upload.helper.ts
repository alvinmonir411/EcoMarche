import { BadRequestException } from "@nestjs/common";
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  PRODUCT_UPLOAD_FOLDER,
  PRODUCT_UPLOAD_URL,
} from "../constants/upload.constants";

const productUploadPath = join(process.cwd(), PRODUCT_UPLOAD_FOLDER);

export const productImageUploadOptions = {
  storage: diskStorage({
    destination: (_request, _file, callback) => {
      if (!existsSync(productUploadPath)) {
        mkdirSync(productUploadPath, { recursive: true });
      }

      callback(null, productUploadPath);
    },
    filename: (_request, file, callback) => {
      const fileExtension = extname(file.originalname);
      const fileName = `${Date.now()}-${randomUUID()}${fileExtension}`;

      callback(null, fileName);
    },
  }),
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException("Only jpg, jpeg, png and webp images are allowed"),
        false,
      );
    }

    return callback(null, true);
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
};

export function getProductImageUrl(file: Express.Multer.File) {
  return `${PRODUCT_UPLOAD_URL}/${file.filename}`;
}
