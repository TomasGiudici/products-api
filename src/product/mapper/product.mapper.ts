import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductByEanDto } from '../dto/find-product-by-ean.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import type { CreateProductPersistenceData } from '../interface/create-product-data.interface';
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

export interface ProductRelationIds {
  brandId: number;
  categoryId: number;
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

  static toPersistence(
    createProductData: CreateProductData,
    relationIds: ProductRelationIds,
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
