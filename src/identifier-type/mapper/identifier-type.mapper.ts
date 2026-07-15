import { normalizeCode } from '../../common/utils/normalize-code.util';
import type { identifier_type as IdentifierType } from '../../generated/prisma/client';
import { CreateIdentifierTypeDto } from '../dto/create-identifier-type.dto';
import { IdentifierTypeResponseDto } from '../dto/identifier-type-response.dto';
import { CreateIdentifierTypePersistenceData } from '../repository/identifier-type.repository.interface';

export class IdentifierTypeMapper {
  static toPersistence(
    createIdentifierTypeDto: CreateIdentifierTypeDto,
  ): CreateIdentifierTypePersistenceData {
    return {
      code: normalizeCode(createIdentifierTypeDto.code),
      name: createIdentifierTypeDto.name.trim(),
      description: createIdentifierTypeDto.description?.trim(),
    };
  }

  static toResponse(identifierType: IdentifierType): IdentifierTypeResponseDto {
    return {
      id: identifierType.id,
      code: identifierType.code,
      name: identifierType.name,
      description: identifierType.description,
      active: identifierType.active,
    };
  }

  static toResponseList(
    identifierTypes: IdentifierType[],
  ): IdentifierTypeResponseDto[] {
    return identifierTypes.map((identifierType) =>
      this.toResponse(identifierType),
    );
  }
}
