import type { ItemDimensionsDto } from '../dto/item-dimensions.dto';

export interface RawImportItemRow {
  __rowNumber: number;
  [key: string]: unknown;
}

export interface ImportItemData {
  row: number;
  ean: string;

  itemTypeCode?: string;

  name: string;
  description?: string;

  brandName?: string;
  categoryName?: string;

  quantity?: number;
  unitAbbreviation?: string;
  unitsPerPack?: number;

  dimensions?: ItemDimensionsDto;
  metadata?: Record<string, unknown>;
}
