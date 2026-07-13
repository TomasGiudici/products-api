import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { StorageModule } from './storage/storage.module';
import { UnitOfMeasureModule } from './unit-of-measure/unit-of-measure.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BrandModule,
    CategoryModule,
    UnitOfMeasureModule,
    StorageModule,
    ProductModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
