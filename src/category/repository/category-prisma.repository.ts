import { Injectable } from '@nestjs/common';
import type { category as Category } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCategoryPersistenceData,
  ICategoryRepository,
} from './category.repository.interface';

@Injectable()
export class CategoryPrismaRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryPersistenceData): Promise<Category> {
    return this.prisma.category.create({
      data,
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  async findByNormalizedName(normalizedName: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: {
        normalized_name: normalizedName,
      },
    });
  }
}
