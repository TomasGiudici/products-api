import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { ItemDetail } from '../interface/item-detail.interface';
import type {
  CreateItemPersistenceData,
  UpdateItemPersistenceData,
} from '../interface/item-persistence-data.interface';
import type {
  FindItemsFilters,
  FindItemsPagination,
  FindItemsResult,
  IItemRepository,
  SearchItemsResult,
} from './item.repository.interface';

@Injectable()
export class ItemPrismaRepository implements IItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ItemDetail | null> {
    const item = await this.prisma.item.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      return null;
    }

    return this.toItemDetail(item);
  }

  async findByEan(ean: string): Promise<ItemDetail | null> {
    const item = await this.prisma.item.findUnique({
      where: {
        ean,
      },
    });

    if (!item) {
      return null;
    }

    return this.toItemDetail(item);
  }

  async findMany(
    filters: FindItemsFilters,
    pagination: FindItemsPagination,
  ): Promise<FindItemsResult> {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [
          {
            name: 'asc',
          },
          {
            id: 'asc',
          },
        ],
      }),
      this.prisma.item.count({
        where,
      }),
    ]);

    return {
      items: items.map((item) => this.toItemDetail(item)),
      total,
    };
  }

  async searchByNormalizedName(
    normalizedName: string,
    pagination: FindItemsPagination,
  ): Promise<SearchItemsResult> {
    const where: Prisma.itemWhereInput = {
      normalized_name: {
        contains: normalizedName,
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        include: {
          brand: true,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ normalized_name: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.item.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...this.toItemDetail(item),
        brandName: item.brand?.name ?? null,
      })),
      total,
    };
  }

  async findExportBatch(
    filters: FindItemsFilters,
    pagination: FindItemsPagination,
  ): Promise<ItemDetail[]> {
    const where = this.buildWhere(filters);

    const items = await this.prisma.item.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [
        {
          name: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });

    return items.map((item) => this.toItemDetail(item));
  }

  private buildWhere(filters: FindItemsFilters): Prisma.itemWhereInput {
    const where: Prisma.itemWhereInput = {};

    if (filters.brand_id !== undefined) {
      where.brand_id = filters.brand_id;
    }

    if (filters.category_id !== undefined) {
      where.category_id = filters.category_id;
    }

    if (filters.normalized_name !== undefined) {
      where.normalized_name = {
        contains: filters.normalized_name,
      };
    }

    return where;
  }

  async create(data: CreateItemPersistenceData): Promise<ItemDetail> {
    const item = await this.prisma.item.create({
      data: {
        ean: data.ean,

        item_type_id: data.item_type_id,

        name: data.name,
        normalized_name: data.normalized_name,
        description: data.description,

        brand_id: data.brand_id,
        category_id: data.category_id,

        quantity: data.quantity,
        unit_id: data.unit_id,
        units_per_pack: data.units_per_pack,

        image_path: data.image_path,

        dimensions: data.dimensions as Prisma.InputJsonValue | undefined,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return this.toItemDetail(item);
  }

  async updateById(
    id: string,
    data: UpdateItemPersistenceData,
  ): Promise<ItemDetail> {
    const item = await this.prisma.item.update({
      where: {
        id,
      },
      data: {
        item_type_id: data.item_type_id,

        name: data.name,
        normalized_name: data.normalized_name,
        description: data.description,

        brand_id: data.brand_id,
        category_id: data.category_id,

        quantity: data.quantity,
        unit_id: data.unit_id,
        units_per_pack: data.units_per_pack,

        image_path: data.image_path,

        dimensions: data.dimensions as Prisma.InputJsonValue | undefined,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return this.toItemDetail(item);
  }

  private toItemDetail(item: {
    id: string;

    ean: string;

    item_type_id: number | null;

    name: string;
    description: string | null;

    brand_id: number | null;
    category_id: number | null;

    quantity: { toNumber(): number } | null;
    unit_id: number | null;
    units_per_pack: number | null;

    image_path: string | null;

    dimensions: Prisma.JsonValue | null;
    metadata: Prisma.JsonValue | null;
  }): ItemDetail {
    return {
      id: item.id,

      ean: item.ean,

      itemTypeId: item.item_type_id,

      name: item.name,
      description: item.description,

      brandId: item.brand_id,
      categoryId: item.category_id,

      quantity: item.quantity?.toNumber() ?? null,
      unitId: item.unit_id,
      unitsPerPack: item.units_per_pack,

      imagePath: item.image_path,

      dimensions: this.toDimensions(item.dimensions),
      metadata: this.toMetadata(item.metadata),
    };
  }

  private toDimensions(
    dimensions: Prisma.JsonValue | null,
  ): ItemDetail['dimensions'] {
    if (
      dimensions &&
      typeof dimensions === 'object' &&
      !Array.isArray(dimensions)
    ) {
      return dimensions;
    }

    return null;
  }

  private toMetadata(
    metadata: Prisma.JsonValue | null,
  ): Record<string, unknown> | null {
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      return metadata;
    }

    return null;
  }

  async findByEans(eans: string[]): Promise<ItemDetail[]> {
    if (eans.length === 0) {
      return [];
    }

    const items = await this.prisma.item.findMany({
      where: {
        ean: {
          in: eans,
        },
      },
    });

    return items.map((item) => this.toItemDetail(item));
  }
}
