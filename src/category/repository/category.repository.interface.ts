import type { category as Category } from '../../generated/prisma/client';

export interface CreateCategoryPersistenceData {
  name: string;
  normalized_name: string;
}

export interface ICategoryRepository {
  create(data: CreateCategoryPersistenceData): Promise<Category>;

  findAll(): Promise<Category[]>;

  findById(id: number): Promise<Category | null>;

  findByNormalizedName(normalizedName: string): Promise<Category | null>;
}
