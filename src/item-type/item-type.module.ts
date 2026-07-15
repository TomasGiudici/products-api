import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ItemTypeController } from './item-type.controller';
import { ItemTypeService } from './item-type.service';
import { ItemTypePrismaRepository } from './repository/item-type-prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ItemTypeController],
  providers: [
    ItemTypeService,
    {
      provide: 'itemTypeRepository',
      useClass: ItemTypePrismaRepository,
    },
  ],
  exports: [ItemTypeService],
})
export class ItemTypeModule {}
