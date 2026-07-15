import { BrandResponseDto } from '../../brand/dto/brand-response.dto';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';
import { IdentifierTypeResponseDto } from '../../identifier-type/dto/identifier-type-response.dto';
import { ItemTypeResponseDto } from '../../item-type/dto/item-type-response.dto';
import { UnitOfMeasureResponseDto } from '../../unit-of-measure/dto/unit-of-measure-response.dto';

export class ItemResponseDto {
  id!: string;

  identifierType!: IdentifierTypeResponseDto;
  identifierValue!: string;

  itemType!: ItemTypeResponseDto | null;

  name!: string;

  brand!: BrandResponseDto | null;
  category!: CategoryResponseDto | null;

  quantity!: number | null;
  unitsPerPack!: number | null;

  unit!: UnitOfMeasureResponseDto | null;

  imagePath!: string | null;

  metadata!: Record<string, unknown> | null;
}
