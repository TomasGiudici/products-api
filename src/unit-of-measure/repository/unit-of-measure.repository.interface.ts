import type { unit_of_measure as UnitOfMeasure } from '../../generated/prisma/client';

export interface CreateUnitOfMeasurePersistenceData {
  name: string;
  abbreviation: string;
}

export interface IUnitOfMeasureRepository {
  create(data: CreateUnitOfMeasurePersistenceData): Promise<UnitOfMeasure>;

  findAll(): Promise<UnitOfMeasure[]>;

  findById(id: number): Promise<UnitOfMeasure | null>;

  findByAbbreviation(abbreviation: string): Promise<UnitOfMeasure | null>;
}
