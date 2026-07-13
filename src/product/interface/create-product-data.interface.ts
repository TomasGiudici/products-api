export interface CreateProductPersistenceData {
  ean: string;
  name: string;
  brand_id: number;
  category_id: number;
  quantity?: number;
  unit_id?: number;
  units_per_pack?: number;
  image_path?: string;
}
