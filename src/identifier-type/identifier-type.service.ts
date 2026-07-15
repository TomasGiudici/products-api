import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { normalizeCode } from '../common/utils/normalize-code.util';
import { CreateIdentifierTypeDto } from './dto/create-identifier-type.dto';
import { IdentifierTypeResponseDto } from './dto/identifier-type-response.dto';
import { IdentifierTypeMapper } from './mapper/identifier-type.mapper';
import type { IIdentifierTypeRepository } from './repository/identifier-type.repository.interface';

@Injectable()
export class IdentifierTypeService {
  constructor(
    @Inject('identifierTypeRepository')
    private readonly identifierTypeRepository: IIdentifierTypeRepository,
  ) {}

  async create(
    createIdentifierTypeDto: CreateIdentifierTypeDto,
  ): Promise<IdentifierTypeResponseDto> {
    const persistenceData = IdentifierTypeMapper.toPersistence(
      createIdentifierTypeDto,
    );

    const existingIdentifierType =
      await this.identifierTypeRepository.findByCode(persistenceData.code);

    if (existingIdentifierType) {
      throw new ConflictException(
        'Ya existe un tipo de identificador con ese código.',
      );
    }

    const createdIdentifierType =
      await this.identifierTypeRepository.create(persistenceData);

    return IdentifierTypeMapper.toResponse(createdIdentifierType);
  }

  async findAll(): Promise<IdentifierTypeResponseDto[]> {
    const identifierTypes = await this.identifierTypeRepository.findAll();

    return IdentifierTypeMapper.toResponseList(identifierTypes);
  }

  async findById(id: number): Promise<IdentifierTypeResponseDto> {
    const identifierType = await this.identifierTypeRepository.findById(id);

    if (!identifierType) {
      throw new NotFoundException('Tipo de identificador no encontrado.');
    }

    return IdentifierTypeMapper.toResponse(identifierType);
  }

  async findByCode(code: string): Promise<IdentifierTypeResponseDto | null> {
    const normalizedCode = normalizeCode(code);

    const identifierType =
      await this.identifierTypeRepository.findByCode(normalizedCode);

    if (!identifierType) {
      return null;
    }

    return IdentifierTypeMapper.toResponse(identifierType);
  }
}
