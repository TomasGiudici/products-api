import type { identifier_type as IdentifierType } from '../../generated/prisma/client';

export interface CreateIdentifierTypePersistenceData {
  code: string;
  name: string;
  description?: string;
}

export interface IIdentifierTypeRepository {
  create(data: CreateIdentifierTypePersistenceData): Promise<IdentifierType>;

  findAll(): Promise<IdentifierType[]>;

  findById(id: number): Promise<IdentifierType | null>;

  findByCode(code: string): Promise<IdentifierType | null>;
}
