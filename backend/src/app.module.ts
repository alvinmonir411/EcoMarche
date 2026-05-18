import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AddressesModule } from "./addresses/addresses.module";
import { AuthModule } from "./auth/auth.module";
import { CartsModule } from "./carts/carts.module";
import { CategoriesModule } from "./categories/categories.module";
import { CouponsModule } from "./coupons/coupons.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { WishlistsModule } from "./wishlists/wishlists.module";
import { ReviewsModule } from "./reviews/reviews.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: true, // Only for development
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CouponsModule,
    CartsModule,
    OrdersModule,
    WishlistsModule,
    AddressesModule,
    PaymentsModule,
    AdminModule,
    ReviewsModule,
  ],
})
export class AppModule {}
