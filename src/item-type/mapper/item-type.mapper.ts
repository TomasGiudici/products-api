import { normalizeCode } from '../../common/utils/normalize-code.util';
import type {
  item_type as ItemType,
  Prisma,
} from '../../generated/prisma/client';
import { CreateItemTypeDto } from '../dto/create-item-type.dto';
import { ItemTypeResponseDto } from '../dto/item-type-response.dto';
import { CreateItemTypePersistenceData } from '../repository/item-type.repository.interface';

export class ItemTypeMapper {
  static toPersistence(
    createItemTypeDto: CreateItemTypeDto,
  ): CreateItemTypePersistenceData {
    return {
      code: normalizeCode(createItemTypeDto.code),
      name: createItemTypeDto.name.trim(),
      description: createItemTypeDto.description?.trim(),
      metadata_schema: createItemTypeDto.metadataSchema,
    };
  }

  static toResponse(itemType: ItemType): ItemTypeResponseDto {
    return {
      id: itemType.id,
      code: itemType.code,
      name: itemType.name,
      description: itemType.description,
      metadataSchema: this.toMetadataSchema(itemType.metadata_schema),
      active: itemType.active,
    };
  }

  static toResponseList(itemTypes: ItemType[]): ItemTypeResponseDto[] {
    return itemTypes.map((itemType) => this.toResponse(itemType));
  }

  private static toMetadataSchema(
    metadataSchema: Prisma.JsonValue | null,
  ): Record<string, unknown> | null {
    if (
      metadataSchema &&
      typeof metadataSchema === 'object' &&
      !Array.isArray(metadataSchema)
    ) {
      return metadataSchema;
    }

    return null;
  }
}
