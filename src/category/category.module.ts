import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryPrismaRepository } from './repository/category-prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    {
      provide: 'categoryRepository',
      useClass: CategoryPrismaRepository,
    },
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
