import { BrandResponseDto } from '../../brand/dto/brand-response.dto';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';
import { normalizeText } from '../../common/utils/normalize-text.util';
import { ItemTypeResponseDto } from '../../item-type/dto/item-type-response.dto';
import { UnitOfMeasureResponseDto } from '../../unit-of-measure/dto/unit-of-measure-response.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { FilterItemsDto } from '../dto/filter-items.dto';
import type { ItemDimensionsDto } from '../dto/item-dimensions.dto';
import { ItemResponseDto } from '../dto/item-response.dto';
import { ItemSummaryResponseDto } from '../dto/item-summary-response.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import type { ItemDetail } from '../interface/item-detail.interface';
import type { ImportItemData } from '../interface/import-item-data.interface';
import type {
  CreateItemPersistenceData,
  UpdateItemPersistenceData,
} from '../interface/item-persistence-data.interface';

export interface CreateItemData {
  ean: string;

  itemTypeCode?: string;

  name: string;
  normalizedName: string;
  description?: string;

  brandName?: string;
  categoryName?: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;

  dimensions?: ItemDimensionsDto;
  metadata?: Record<string, unknown>;
}

export interface UpdateItemData {
  itemTypeCode?: string;

  name?: string;
  normalizedName?: string;
  description?: string;

  brandName?: string;
  categoryName?: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;

  dimensions?: ItemDimensionsDto;
  metadata?: Record<string, unknown>;
}

export interface FilterItemsData {
  brandName?: string;
  categoryName?: string;
  search?: string;
  normalizedSearch?: string;
  page: number;
}

export interface CreateItemRelationIds {
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
  itemType: ItemTypeResponseDto | null;
  brand: BrandResponseDto | null;
  category: CategoryResponseDto | null;
  unit: UnitOfMeasureResponseDto | null;
}

export interface ItemSummaryResponseRelations {
  brand: Pick<BrandResponseDto, 'name'> | null;
}

export type ItemSummarySource = Pick<ItemDetail, 'ean' | 'name'>;

export interface ItemResponseComputedData {
  imageUrl: string | null;
}

export class ItemMapper {
  static toCreateData(createItemDto: CreateItemDto): CreateItemData {
    const name = createItemDto.name.trim();

    return {
      ean: createItemDto.ean.trim(),

      itemTypeCode: createItemDto.itemTypeCode?.trim(),

      name,
      normalizedName: normalizeText(name),
      description: createItemDto.description?.trim(),

      brandName: createItemDto.brandName?.trim(),
      categoryName: createItemDto.categoryName?.trim(),

      quantity: createItemDto.quantity,
      unitAbbreviation: createItemDto.unitAbbreviation?.trim(),
      unitsPerPack: createItemDto.unitsPerPack,

      dimensions: createItemDto.dimensions,
      metadata: createItemDto.metadata,
    };
  }

  static toUpdateData(updateItemDto: UpdateItemDto): UpdateItemData {
    const name = updateItemDto.name?.trim();

    return {
      itemTypeCode: updateItemDto.itemTypeCode?.trim(),

      name,
      normalizedName: name ? normalizeText(name) : undefined,
      description: updateItemDto.description?.trim(),

      brandName: updateItemDto.brandName?.trim(),
      categoryName: updateItemDto.categoryName?.trim(),

      quantity: updateItemDto.quantity,
      unitAbbreviation: updateItemDto.unitAbbreviation?.trim(),
      unitsPerPack: updateItemDto.unitsPerPack,

      dimensions: updateItemDto.dimensions,
      metadata: updateItemDto.metadata,
    };
  }

  static toFilterData(filterItemsDto: FilterItemsDto): FilterItemsData {
    const search = filterItemsDto.search?.trim();

    return {
      brandName: filterItemsDto.brandName?.trim(),
      categoryName: filterItemsDto.categoryName?.trim(),
      search,
      normalizedSearch: search ? normalizeText(search) : undefined,
      page: filterItemsDto.page ?? 1,
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
      ean: createItemData.ean,

      item_type_id: relationIds.itemTypeId,

      name: createItemData.name,
      normalized_name: createItemData.normalizedName,
      description: createItemData.description,

      brand_id: relationIds.brandId,
      category_id: relationIds.categoryId,

      quantity: createItemData.quantity,
      unit_id: relationIds.unitId,
      units_per_pack: createItemData.unitsPerPack,

      image_path: imagePath,

      dimensions: createItemData.dimensions,
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

    if (updateItemData.normalizedName !== undefined) {
      persistenceData.normalized_name = updateItemData.normalizedName;
    }

    if (updateItemData.description !== undefined) {
      persistenceData.description = updateItemData.description;
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

    if (updateItemData.dimensions !== undefined) {
      persistenceData.dimensions = updateItemData.dimensions;
    }

    if (updateItemData.metadata !== undefined) {
      persistenceData.metadata = updateItemData.metadata;
    }

    return persistenceData;
  }

  static toResponse(
    item: ItemDetail,
    relations: ItemResponseRelations,
    computedData: ItemResponseComputedData,
  ): ItemResponseDto {
    return {
      id: item.id ?? null,
      ean: item.ean ?? null,

      itemType: relations.itemType?.name ?? null,

      name: item.name ?? null,
      description: item.description ?? null,

      brand: relations.brand?.name ?? null,
      category: relations.category?.name ?? null,

      quantity: item.quantity ?? null,
      unitAbbreviation: relations.unit?.abbreviation ?? null,

      imageUrl: computedData.imageUrl,

      dimensions: item.dimensions ?? null,
      metadata: item.metadata ?? null,
    };
  }

  static toSummaryResponse(
    item: ItemSummarySource,
    relations: ItemSummaryResponseRelations,
    computedData: ItemResponseComputedData,
  ): ItemSummaryResponseDto {
    return {
      ean: item.ean ?? null,
      name: item.name ?? null,
      brand: relations.brand?.name ?? null,
      imageUrl: computedData.imageUrl,
    };
  }

  static toCreateDataFromImport(
    importItemData: ImportItemData,
  ): CreateItemData {
    const name = importItemData.name.trim();

    return {
      ean: importItemData.ean.trim(),

      itemTypeCode: importItemData.itemTypeCode?.trim(),

      name,
      normalizedName: normalizeText(name),
      description: importItemData.description?.trim(),

      brandName: importItemData.brandName?.trim(),
      categoryName: importItemData.categoryName?.trim(),

      quantity: importItemData.quantity,
      unitAbbreviation: importItemData.unitAbbreviation?.trim(),
      unitsPerPack: importItemData.unitsPerPack,

      dimensions: importItemData.dimensions,
      metadata: importItemData.metadata,
    };
  }

  static toUpdateDataFromImport(
    importItemData: ImportItemData,
  ): UpdateItemData {
    const name = importItemData.name.trim();

    return {
      itemTypeCode: importItemData.itemTypeCode?.trim(),

      name,
      normalizedName: normalizeText(name),
      description: importItemData.description?.trim(),

      brandName: importItemData.brandName?.trim(),
      categoryName: importItemData.categoryName?.trim(),

      quantity: importItemData.quantity,
      unitAbbreviation: importItemData.unitAbbreviation?.trim(),
      unitsPerPack: importItemData.unitsPerPack,

      dimensions: importItemData.dimensions,
      metadata: importItemData.metadata,
    };
  }
}
