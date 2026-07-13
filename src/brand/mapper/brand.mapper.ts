import { normalizeText } from '../../common/utils/normalize-text.util';
import { BrandResponseDto } from '../dto/brand-response.dto';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { BrandReferenceDto } from '../dto/brand-reference.dto';
import type { brand as Brand } from '../../generated/prisma/client';
import { CreateBrandPersistenceData } from '../repository/brand.repository.interface';

export class BrandMapper {
  static toPersistence(
    createBrandDto: CreateBrandDto,
  ): CreateBrandPersistenceData {
    const name = createBrandDto.name.trim();

    return {
      name,
      normalized_name: normalizeText(name),
    };
  }

  static toResponse(brand: Brand): BrandResponseDto {
    return {
      id: brand.id,
      name: brand.name,
    };
  }

  static toResponseList(brands: Brand[]): BrandResponseDto[] {
    return brands.map((brand) => this.toResponse(brand));
  }

  static toReference(brand: Brand): BrandReferenceDto {
    return {
      id: brand.id,
      name: brand.name,
    };
  }
}
