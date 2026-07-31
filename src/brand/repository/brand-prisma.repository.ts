import { Injectable } from '@nestjs/common';
import type { brand as Brand } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBrandPersistenceData,
  IBrandRepository,
} from './brand.repository.interface';

@Injectable()
export class BrandPrismaRepository implements IBrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBrandPersistenceData): Promise<Brand> {
    return this.prisma.brand.create({
      data,
    });
  }

  async findAll(): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: number): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: {
        name,
      },
    });
  }

  async findByNormalizedName(normalizedName: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: {
        normalized_name: normalizedName,
      },
    });
  }
}
