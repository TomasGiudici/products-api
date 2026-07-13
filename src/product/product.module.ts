import { Module } from '@nestjs/common';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductPrismaRepository } from './repository/product-prisma.repository';

@Module({
  imports: [
    PrismaModule,
    BrandModule,
    CategoryModule,
    UnitOfMeasureModule,
    StorageModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: 'productRepository',
      useClass: ProductPrismaRepository,
    },
  ],
})
export class ProductModule {}
