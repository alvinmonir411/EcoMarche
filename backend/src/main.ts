import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import { AppModule } from "./app.module";
import {
  API_PREFIX,
  DEFAULT_FRONTEND_URL,
  DEFAULT_PORT,
  SWAGGER_PATH,
} from "./common/constants/api.constants";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["log", "error", "warn", "debug"],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  app.setGlobalPrefix(API_PREFIX);

  app.enableCors({
    origin: [
      configService.get<string>("FRONTEND_URL", DEFAULT_FRONTEND_URL),
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("EcoMarche API")
    .setDescription("API documentation for the EcoMarche e-commerce backend")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`/${API_PREFIX}`)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  const port = Number(configService.get<string>("PORT") || DEFAULT_PORT);

  await app.listen(port, "0.0.0.0");
  logger.log(`API is running on http://127.0.0.1:${port}/${API_PREFIX}`);
  logger.log(`Swagger docs are available at http://127.0.0.1:${port}/${SWAGGER_PATH}`);
}

bootstrap();
