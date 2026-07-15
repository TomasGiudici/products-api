import type { item_type as ItemType } from '../../generated/prisma/client';

export interface CreateItemTypePersistenceData {
  code: string;
  name: string;
  description?: string;
  metadata_schema?: Record<string, unknown>;
}

export interface IItemTypeRepository {
  create(data: CreateItemTypePersistenceData): Promise<ItemType>;

  findAll(): Promise<ItemType[]>;

  findById(id: number): Promise<ItemType | null>;

  findByCode(code: string): Promise<ItemType | null>;
}
