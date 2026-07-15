import { Module } from '@nestjs/common';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { IdentifierTypeModule } from '../identifier-type/identifier-type.module';
import { ItemTypeModule } from '../item-type/item-type.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemPrismaRepository } from './repository/item-prisma.repository';

@Module({
  imports: [
    PrismaModule,
    IdentifierTypeModule,
    ItemTypeModule,
    BrandModule,
    CategoryModule,
    UnitOfMeasureModule,
    StorageModule,
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    {
      provide: 'itemRepository',
      useClass: ItemPrismaRepository,
    },
  ],
})
export class ItemModule {}
