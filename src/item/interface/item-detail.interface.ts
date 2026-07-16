import { ItemDimensionsDto } from '../dto/item-dimensions.dto';

export interface ItemDetail {
  id: string;
  ean: string;

  itemTypeId: number | null;

  name: string;
  description: string | null;

  brandId: number | null;
  categoryId: number | null;

  quantity: number | null;
  unitId: number | null;
  unitsPerPack: number | null;

  imagePath: string | null;

  dimensions: ItemDimensionsDto | null;
  metadata: Record<string, unknown> | null;
}
