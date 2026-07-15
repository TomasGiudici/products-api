import { normalizeIdentifierValue } from '../../common/utils/normalize-identifier-value.util';
import { BrandResponseDto } from '../../brand/dto/brand-response.dto';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';
import { IdentifierTypeResponseDto } from '../../identifier-type/dto/identifier-type-response.dto';
import { ItemTypeResponseDto } from '../../item-type/dto/item-type-response.dto';
import { UnitOfMeasureResponseDto } from '../../unit-of-measure/dto/unit-of-measure-response.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { FindItemByIdentifierDto } from '../dto/find-item-by-identifier.dto';
import { ItemResponseDto } from '../dto/item-response.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import type { ItemDetail } from '../interface/item-detail.interface';
import type {
  CreateItemPersistenceData,
  UpdateItemPersistenceData,
} from '../interface/item-persistence-data.interface';

export interface CreateItemData {
  identifierTypeCode: string;
  identifierValue: string;
  normalizedIdentifierValue: string;

  itemTypeCode?: string;

  name: string;

  brandName?: string;
  categoryName?: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;

  metadata?: Record<string, unknown>;
}

export interface UpdateItemData {
  itemTypeCode?: string;

  name?: string;

  brandName?: string;
  categoryName?: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;

  metadata?: Record<string, unknown>;
}

export interface CreateItemRelationIds {
  identifierTypeId: number;
  itemTypeId?: number;
  brandId?: number;
  categoryId?: number;
  unitId?: number;
}

export interface UpdateItemRelationIds {
  itemTypeId?: number;
  brandId?: number;
  categoryId?: number;
  unitId?: number;
}

export interface ItemResponseRelations {
  identifierType: IdentifierTypeResponseDto;
  itemType: ItemTypeResponseDto | null;
  brand: BrandResponseDto | null;
  category: CategoryResponseDto | null;
  unit: UnitOfMeasureResponseDto | null;
}

export class ItemMapper {
  static toCreateData(createItemDto: CreateItemDto): CreateItemData {
    const identifierValue = createItemDto.identifierValue.trim();

    return {
      identifierTypeCode: createItemDto.identifierTypeCode.trim(),
      identifierValue,
      normalizedIdentifierValue: normalizeIdentifierValue(identifierValue),

      itemTypeCode: createItemDto.itemTypeCode?.trim(),

      name: createItemDto.name.trim(),

      brandName: createItemDto.brandName?.trim(),
      categoryName: createItemDto.categoryName?.trim(),

      quantity: createItemDto.quantity,
      unitAbbreviation: createItemDto.unitAbbreviation?.trim(),
      unitsPerPack: createItemDto.unitsPerPack,

      metadata: createItemDto.metadata,
    };
  }

  static toUpdateData(updateItemDto: UpdateItemDto): UpdateItemData {
    return {
      itemTypeCode: updateItemDto.itemTypeCode?.trim(),

      name: updateItemDto.name?.trim(),

      brandName: updateItemDto.brandName?.trim(),
      categoryName: updateItemDto.categoryName?.trim(),

      quantity: updateItemDto.quantity,
      unitAbbreviation: updateItemDto.unitAbbreviation?.trim(),
      unitsPerPack: updateItemDto.unitsPerPack,

      metadata: updateItemDto.metadata,
    };
  }

  static toIdentifierData(findItemByIdentifierDto: FindItemByIdentifierDto): {
    identifierTypeCode: string;
    identifierValue: string;
    normalizedIdentifierValue: string;
  } {
    const identifierValue = findItemByIdentifierDto.identifierValue.trim();

    return {
      identifierTypeCode: findItemByIdentifierDto.identifierTypeCode.trim(),
      identifierValue,
      normalizedIdentifierValue: normalizeIdentifierValue(identifierValue),
    };
  }

  static hasUpdateData(updateItemData: UpdateItemData): boolean {
    return Object.values(updateItemData).some((value) => value !== undefined);
  }

  static toCreatePersistence(
    createItemData: CreateItemData,
    relationIds: CreateItemRelationIds,
    imagePath?: string,
  ): CreateItemPersistenceData {
    return {
      identifier_type_id: relationIds.identifierTypeId,
      identifier_value: createItemData.identifierValue,
      normalized_identifier_value: createItemData.normalizedIdentifierValue,

      item_type_id: relationIds.itemTypeId,

      name: createItemData.name,

      brand_id: relationIds.brandId,
      category_id: relationIds.categoryId,

      quantity: createItemData.quantity,
      unit_id: relationIds.unitId,
      units_per_pack: createItemData.unitsPerPack,

      image_path: imagePath,

      metadata: createItemData.metadata,
    };
  }

  static toUpdatePersistence(
    updateItemData: UpdateItemData,
    relationIds: UpdateItemRelationIds,
    imagePath?: string,
  ): UpdateItemPersistenceData {
    const persistenceData: UpdateItemPersistenceData = {};

    if (relationIds.itemTypeId !== undefined) {
      persistenceData.item_type_id = relationIds.itemTypeId;
    }

    if (updateItemData.name !== undefined) {
      persistenceData.name = updateItemData.name;
    }

    if (relationIds.brandId !== undefined) {
      persistenceData.brand_id = relationIds.brandId;
    }

    if (relationIds.categoryId !== undefined) {
      persistenceData.category_id = relationIds.categoryId;
    }

    if (updateItemData.quantity !== undefined) {
      persistenceData.quantity = updateItemData.quantity;
    }

    if (relationIds.unitId !== undefined) {
      persistenceData.unit_id = relationIds.unitId;
    }

    if (updateItemData.unitsPerPack !== undefined) {
      persistenceData.units_per_pack = updateItemData.unitsPerPack;
    }

    if (imagePath !== undefined) {
      persistenceData.image_path = imagePath;
    }

    if (updateItemData.metadata !== undefined) {
      persistenceData.metadata = updateItemData.metadata;
    }

    return persistenceData;
  }

  static toResponse(
    item: ItemDetail,
    relations: ItemResponseRelations,
  ): ItemResponseDto {
    return {
      id: item.id,

      identifierType: relations.identifierType,
      identifierValue: item.identifierValue,

      itemType: relations.itemType,

      name: item.name,

      brand: relations.brand,
      category: relations.category,

      quantity: item.quantity,
      unitsPerPack: item.unitsPerPack,

      unit: relations.unit,

      imagePath: item.imagePath,

      metadata: item.metadata,
    };
  }
}
