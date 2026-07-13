import type { unit_of_measure as UnitOfMeasure } from '../../generated/prisma/client';
import { CreateUnitOfMeasureDto } from '../dto/create-unit-of-measure.dto';
import { UnitOfMeasureResponseDto } from '../dto/unit-of-measure-response.dto';
import { CreateUnitOfMeasurePersistenceData } from '../repository/unit-of-measure.repository.interface';

export class UnitOfMeasureMapper {
  static normalizeAbbreviation(abbreviation: string): string {
    return abbreviation.trim().toLowerCase().replace(/\./g, '');
  }

  static toPersistence(
    createUnitOfMeasureDto: CreateUnitOfMeasureDto,
  ): CreateUnitOfMeasurePersistenceData {
    return {
      name: createUnitOfMeasureDto.name.trim(),
      abbreviation: this.normalizeAbbreviation(
        createUnitOfMeasureDto.abbreviation,
      ),
    };
  }

  static toResponse(unitOfMeasure: UnitOfMeasure): UnitOfMeasureResponseDto {
    return {
      id: unitOfMeasure.id,
      name: unitOfMeasure.name,
      abbreviation: unitOfMeasure.abbreviation,
    };
  }

  static toResponseList(
    unitsOfMeasure: UnitOfMeasure[],
  ): UnitOfMeasureResponseDto[] {
    return unitsOfMeasure.map((unitOfMeasure) =>
      this.toResponse(unitOfMeasure),
    );
  }
}
