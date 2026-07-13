import { Injectable } from '@nestjs/common';
import type { unit_of_measure as UnitOfMeasure } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateUnitOfMeasurePersistenceData,
  IUnitOfMeasureRepository,
} from './unit-of-measure.repository.interface';

@Injectable()
export class UnitOfMeasurePrismaRepository implements IUnitOfMeasureRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateUnitOfMeasurePersistenceData,
  ): Promise<UnitOfMeasure> {
    return this.prisma.unit_of_measure.create({
      data,
    });
  }

  async findAll(): Promise<UnitOfMeasure[]> {
    return this.prisma.unit_of_measure.findMany({
      orderBy: {
        abbreviation: 'asc',
      },
    });
  }

  async findById(id: number): Promise<UnitOfMeasure | null> {
    return this.prisma.unit_of_measure.findUnique({
      where: {
        id,
      },
    });
  }

  async findByAbbreviation(
    abbreviation: string,
  ): Promise<UnitOfMeasure | null> {
    return this.prisma.unit_of_measure.findUnique({
      where: {
        abbreviation,
      },
    });
  }
}
