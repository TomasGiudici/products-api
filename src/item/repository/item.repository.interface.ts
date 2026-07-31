import type {
  CreateItemPersistenceData,
  UpdateItemPersistenceData,
} from '../interface/item-persistence-data.interface';
import type { ItemDetail } from '../interface/item-detail.interface';

export interface FindItemsFilters {
  brand_id?: number;
  category_id?: number;
  normalized_name?: string;
}

export interface FindItemsPagination {
  skip: number;
  take: number;
}

export interface FindItemsResult {
  items: ItemDetail[];
  total: number;
}

export interface IItemRepository {
  findById(id: string): Promise<ItemDetail | null>;

  findByEan(ean: string): Promise<ItemDetail | null>;

  findByEans(eans: string[]): Promise<ItemDetail[]>;

  findMany(
    filters: FindItemsFilters,
    pagination: FindItemsPagination,
  ): Promise<FindItemsResult>;

  create(data: CreateItemPersistenceData): Promise<ItemDetail>;

  updateById(id: string, data: UpdateItemPersistenceData): Promise<ItemDetail>;

  findExportBatch(
    filters: FindItemsFilters,
    pagination: FindItemsPagination,
  ): Promise<ItemDetail[]>;
}
