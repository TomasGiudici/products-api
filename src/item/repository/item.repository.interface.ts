import type {
  CreateItemPersistenceData,
  UpdateItemPersistenceData,
} from '../interface/item-persistence-data.interface';
import type { ItemDetail } from '../interface/item-detail.interface';

export interface IItemRepository {
  findById(id: string): Promise<ItemDetail | null>;

  findByIdentifier(
    identifierTypeId: number,
    normalizedIdentifierValue: string,
  ): Promise<ItemDetail | null>;

  create(data: CreateItemPersistenceData): Promise<ItemDetail>;

  updateById(id: string, data: UpdateItemPersistenceData): Promise<ItemDetail>;
}
