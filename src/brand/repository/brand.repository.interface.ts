import type { brand as Brand } from '../../generated/prisma/client';

export interface CreateBrandPersistenceData {
  name: string;
  normalized_name: string;
}

export interface IBrandRepository {
  create(data: CreateBrandPersistenceData): Promise<Brand>;

  findAll(): Promise<Brand[]>;

  findById(id: number): Promise<Brand | null>;

  findByName(name: string): Promise<Brand | null>;

  findByNormalizedName(normalizedName: string): Promise<Brand | null>;
}
