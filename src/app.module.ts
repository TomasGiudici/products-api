import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { HealthModule } from './health/health.module';
import { IdentifierTypeModule } from './identifier-type/identifier-type.module';
import { ItemModule } from './item/item.module';
import { ItemTypeModule } from './item-type/item-type.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { UnitOfMeasureModule } from './unit-of-measure/unit-of-measure.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    BrandModule,
    CategoryModule,
    UnitOfMeasureModule,
    IdentifierTypeModule,
    ItemTypeModule,
    StorageModule,
    ItemModule,
  ],
})
export class AppModule {}
