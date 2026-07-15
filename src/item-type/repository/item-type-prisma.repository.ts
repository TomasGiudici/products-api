import { Injectable } from '@nestjs/common';
import type {
  item_type as ItemType,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateItemTypePersistenceData,
  IItemTypeRepository,
} from './item-type.repository.interface';

@Injectable()
export class ItemTypePrismaRepository implements IItemTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateItemTypePersistenceData): Promise<ItemType> {
    return this.prisma.item_type.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        metadata_schema: data.metadata_schema as
          Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findAll(): Promise<ItemType[]> {
    return this.prisma.item_type.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findById(id: number): Promise<ItemType | null> {
    return this.prisma.item_type.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code: string): Promise<ItemType | null> {
    return this.prisma.item_type.findUnique({
      where: {
        code,
      },
    });
  }
}
