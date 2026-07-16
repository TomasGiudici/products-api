import { ItemDimensionsDto } from '../dto/item-dimensions.dto';

export interface CreateItemPersistenceData {
  ean: string;

  item_type_id?: number;

  name: string;
  normalized_name: string;
  description?: string;

  brand_id?: number;
  category_id?: number;

  quantity?: number;
  unit_id?: number;
  units_per_pack?: number;

  image_path?: string;

  dimensions?: ItemDimensionsDto;
  metadata?: Record<string, unknown>;
}

export interface UpdateItemPersistenceData {
  item_type_id?: number;

  name?: string;
  normalized_name?: string;
  description?: string;

  brand_id?: number;
  category_id?: number;

  quantity?: number;
  unit_id?: number;
  units_per_pack?: number;

  image_path?: string;

  dimensions?: ItemDimensionsDto;
  metadata?: Record<string, unknown>;
}
