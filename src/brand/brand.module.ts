import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandPrismaRepository } from './repository/brand-prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController],
  providers: [
    BrandService,
    {
      provide: 'brandRepository',
      useClass: BrandPrismaRepository,
    },
  ],
  exports: [BrandService],
})
export class BrandModule {}
