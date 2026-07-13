import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UnitOfMeasurePrismaRepository } from './repository/unit-of-measure-prisma.repository';
import { UnitOfMeasureController } from './unit-of-measure.controller';
import { UnitOfMeasureService } from './unit-of-measure.service';

@Module({
  imports: [PrismaModule],
  controllers: [UnitOfMeasureController],
  providers: [
    UnitOfMeasureService,
    {
      provide: 'unitOfMeasureRepository',
      useClass: UnitOfMeasurePrismaRepository,
    },
  ],
  exports: [UnitOfMeasureService],
})
export class UnitOfMeasureModule {}
