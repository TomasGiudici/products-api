import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { ItemDetail } from '../interface/item-detail.interface';
import type {
  CreateItemPersistenceData,
  UpdateItemPersistenceData,
} from '../interface/item-persistence-data.interface';
import type { IItemRepository } from './item.repository.interface';

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

  async findByIdentifier(
    identifierTypeId: number,
    normalizedIdentifierValue: string,
  ): Promise<ItemDetail | null> {
    const item = await this.prisma.item.findUnique({
      where: {
        identifier_type_id_normalized_identifier_value: {
          identifier_type_id: identifierTypeId,
          normalized_identifier_value: normalizedIdentifierValue,
        },
      },
    });

    if (!item) {
      return null;
    }

    return this.toItemDetail(item);
  }

  async create(data: CreateItemPersistenceData): Promise<ItemDetail> {
    const item = await this.prisma.item.create({
      data: {
        identifier_type_id: data.identifier_type_id,
        identifier_value: data.identifier_value,
        normalized_identifier_value: data.normalized_identifier_value,

        item_type_id: data.item_type_id,

        name: data.name,

        brand_id: data.brand_id,
        category_id: data.category_id,

        quantity: data.quantity,
        unit_id: data.unit_id,
        units_per_pack: data.units_per_pack,

        image_path: data.image_path,

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

        brand_id: data.brand_id,
        category_id: data.category_id,

        quantity: data.quantity,
        unit_id: data.unit_id,
        units_per_pack: data.units_per_pack,

        image_path: data.image_path,

        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return this.toItemDetail(item);
  }

  private toItemDetail(item: {
    id: string;

    identifier_type_id: number;
    identifier_value: string;
    normalized_identifier_value: string;

    item_type_id: number | null;

    name: string;

    brand_id: number | null;
    category_id: number | null;

    quantity: { toNumber(): number } | null;
    unit_id: number | null;
    units_per_pack: number | null;

    image_path: string | null;

    metadata: Prisma.JsonValue | null;
  }): ItemDetail {
    return {
      id: item.id,

      identifierTypeId: item.identifier_type_id,
      identifierValue: item.identifier_value,
      normalizedIdentifierValue: item.normalized_identifier_value,

      itemTypeId: item.item_type_id,

      name: item.name,

      brandId: item.brand_id,
      categoryId: item.category_id,

      quantity: item.quantity?.toNumber() ?? null,
      unitId: item.unit_id,
      unitsPerPack: item.units_per_pack,

      imagePath: item.image_path,

      metadata: this.toMetadata(item.metadata),
    };
  }

  private toMetadata(
    metadata: Prisma.JsonValue | null,
  ): Record<string, unknown> | null {
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      return metadata;
    }

    return null;
  }
}
