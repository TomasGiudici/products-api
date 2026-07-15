export interface CreateItemPersistenceData {
  identifier_type_id: number;
  identifier_value: string;
  normalized_identifier_value: string;

  item_type_id?: number;

  name: string;

  brand_id?: number;
  category_id?: number;

  quantity?: number;
  unit_id?: number;
  units_per_pack?: number;

  image_path?: string;

  metadata?: Record<string, unknown>;
}

export interface UpdateItemPersistenceData {
  item_type_id?: number;

  name?: string;

  brand_id?: number;
  category_id?: number;

  quantity?: number;
  unit_id?: number;
  units_per_pack?: number;

  image_path?: string;

  metadata?: Record<string, unknown>;
}
