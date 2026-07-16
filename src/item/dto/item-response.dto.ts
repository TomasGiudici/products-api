import { ItemDimensionsDto } from './item-dimensions.dto';

export class ItemResponseDto {
  id!: string | null;

  identifierType!: string | null;
  identifierValue!: string | null;

  itemType!: string | null;

  name!: string | null;
  description!: string | null;

  brand!: string | null;
  category!: string | null;

  quantity!: number | null;
  unitAbbreviation!: string | null;

  imagePath!: string | null;

  dimensions!: ItemDimensionsDto | null;
  metadata!: Record<string, unknown> | null;
}
