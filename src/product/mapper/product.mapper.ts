import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductByEanDto } from '../dto/find-product-by-ean.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import type {
  CreateProductPersistenceData,
  UpdateProductPersistenceData,
} from '../interface/create-product-data.interface';
import type { ProductDetail } from '../interface/product-detail.interface';

export interface CreateProductData {
  ean: string;
  name: string;

  brandName: string;
  categoryName: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;
}

export interface UpdateProductData {
  name?: string;

  brandName?: string;
  categoryName?: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;
}

export interface CreateProductRelationIds {
  brandId: number;
  categoryId: number;
  unitId?: number;
}

export interface UpdateProductRelationIds {
  brandId?: number;
  categoryId?: number;
  unitId?: number;
}

export class ProductMapper {
  static toEan(findProductByEanDto: FindProductByEanDto): string {
    return findProductByEanDto.ean;
  }

  static toCreateData(createProductDto: CreateProductDto): CreateProductData {
    return {
      ean: createProductDto.ean,
      name: createProductDto.name.trim(),

      brandName: createProductDto.brandName.trim(),
      categoryName: createProductDto.categoryName.trim(),

      quantity: createProductDto.quantity,
      unitAbbreviation: createProductDto.unitAbbreviation?.trim(),
      unitsPerPack: createProductDto.unitsPerPack,
    };
  }

  static toUpdateData(updateProductDto: UpdateProductDto): UpdateProductData {
    return {
      name: updateProductDto.name?.trim(),

      brandName: updateProductDto.brandName?.trim(),
      categoryName: updateProductDto.categoryName?.trim(),

      quantity: updateProductDto.quantity,
      unitAbbreviation: updateProductDto.unitAbbreviation?.trim(),
      unitsPerPack: updateProductDto.unitsPerPack,
    };
  }

  static hasUpdateData(updateProductData: UpdateProductData): boolean {
    return Object.values(updateProductData).some(
      (value) => value !== undefined,
    );
  }

  static toCreatePersistence(
    createProductData: CreateProductData,
    relationIds: CreateProductRelationIds,
    imagePath?: string,
  ): CreateProductPersistenceData {
    return {
      ean: createProductData.ean,
      name: createProductData.name,
      brand_id: relationIds.brandId,
      category_id: relationIds.categoryId,
      quantity: createProductData.quantity,
      unit_id: relationIds.unitId,
      units_per_pack: createProductData.unitsPerPack,
      image_path: imagePath,
    };
  }

  static toUpdatePersistence(
    updateProductData: UpdateProductData,
    relationIds: UpdateProductRelationIds,
    imagePath?: string,
  ): UpdateProductPersistenceData {
    const persistenceData: UpdateProductPersistenceData = {};

    if (updateProductData.name !== undefined) {
      persistenceData.name = updateProductData.name;
    }

    if (relationIds.brandId !== undefined) {
      persistenceData.brand_id = relationIds.brandId;
    }

    if (relationIds.categoryId !== undefined) {
      persistenceData.category_id = relationIds.categoryId;
    }

    if (updateProductData.quantity !== undefined) {
      persistenceData.quantity = updateProductData.quantity;
    }

    if (relationIds.unitId !== undefined) {
      persistenceData.unit_id = relationIds.unitId;
    }

    if (updateProductData.unitsPerPack !== undefined) {
      persistenceData.units_per_pack = updateProductData.unitsPerPack;
    }

    if (imagePath !== undefined) {
      persistenceData.image_path = imagePath;
    }

    return persistenceData;
  }

  static toResponse(product: ProductDetail): ProductResponseDto {
    return {
      ean: product.ean,
      name: product.name,
      brand: product.brand,
      category: product.category,
      quantity: product.quantity,
      unitsPerPack: product.unitsPerPack,
      unit: product.unit,
      imagePath: product.imagePath,
    };
  }
}
