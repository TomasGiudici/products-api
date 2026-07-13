import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UnitOfMeasureResponseDto } from './dto/unit-of-measure-response.dto';
import { UnitOfMeasureMapper } from './mapper/unit-of-measure.mapper';
import type { IUnitOfMeasureRepository } from './repository/unit-of-measure.repository.interface';

@Injectable()
export class UnitOfMeasureService {
  constructor(
    @Inject('unitOfMeasureRepository')
    private readonly unitOfMeasureRepository: IUnitOfMeasureRepository,
  ) {}

  async createUnitOfMeasure(
    createUnitOfMeasureDto: CreateUnitOfMeasureDto,
  ): Promise<UnitOfMeasureResponseDto> {
    const persistenceData = UnitOfMeasureMapper.toPersistence(
      createUnitOfMeasureDto,
    );

    const existingUnit = await this.unitOfMeasureRepository.findByAbbreviation(
      persistenceData.abbreviation,
    );

    if (existingUnit) {
      throw new ConflictException(
        'Ya existe una unidad de medida con esa abreviatura.',
      );
    }

    const createdUnit =
      await this.unitOfMeasureRepository.create(persistenceData);

    return UnitOfMeasureMapper.toResponse(createdUnit);
  }

  async findAll(): Promise<UnitOfMeasureResponseDto[]> {
    const unitsOfMeasure = await this.unitOfMeasureRepository.findAll();

    return UnitOfMeasureMapper.toResponseList(unitsOfMeasure);
  }

  async findById(id: number): Promise<UnitOfMeasureResponseDto> {
    const unitOfMeasure = await this.unitOfMeasureRepository.findById(id);

    if (!unitOfMeasure) {
      throw new NotFoundException('Unidad de medida no encontrada.');
    }

    return UnitOfMeasureMapper.toResponse(unitOfMeasure);
  }

  async findByAbbreviation(
    abbreviation: string,
  ): Promise<UnitOfMeasureResponseDto | null> {
    const normalizedAbbreviation =
      UnitOfMeasureMapper.normalizeAbbreviation(abbreviation);

    const unitOfMeasure = await this.unitOfMeasureRepository.findByAbbreviation(
      normalizedAbbreviation,
    );

    if (!unitOfMeasure) {
      return null;
    }

    return UnitOfMeasureMapper.toResponse(unitOfMeasure);
  }
}
