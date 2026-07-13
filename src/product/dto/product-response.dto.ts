import { BrandResponseDto } from '../../brand/dto/brand-response.dto';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';
import { UnitOfMeasureResponseDto } from '../../unit-of-measure/dto/unit-of-measure-response.dto';

export class ProductResponseDto {
  ean!: string;
  name!: string;

  brand!: BrandResponseDto;
  category!: CategoryResponseDto;

  quantity!: number | null;
  unitsPerPack!: number | null;

  unit!: UnitOfMeasureResponseDto | null;

  imagePath!: string | null;
}
