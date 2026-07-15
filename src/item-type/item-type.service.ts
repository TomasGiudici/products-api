import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { normalizeCode } from '../common/utils/normalize-code.util';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { ItemTypeResponseDto } from './dto/item-type-response.dto';
import { ItemTypeMapper } from './mapper/item-type.mapper';
import type { IItemTypeRepository } from './repository/item-type.repository.interface';

@Injectable()
export class ItemTypeService {
  constructor(
    @Inject('itemTypeRepository')
    private readonly itemTypeRepository: IItemTypeRepository,
  ) {}

  async create(
    createItemTypeDto: CreateItemTypeDto,
  ): Promise<ItemTypeResponseDto> {
    const persistenceData = ItemTypeMapper.toPersistence(createItemTypeDto);

    const existingItemType = await this.itemTypeRepository.findByCode(
      persistenceData.code,
    );

    if (existingItemType) {
      throw new ConflictException('Ya existe un tipo de ítem con ese código.');
    }

    const createdItemType =
      await this.itemTypeRepository.create(persistenceData);

    return ItemTypeMapper.toResponse(createdItemType);
  }

  async findAll(): Promise<ItemTypeResponseDto[]> {
    const itemTypes = await this.itemTypeRepository.findAll();

    return ItemTypeMapper.toResponseList(itemTypes);
  }

  async findById(id: number): Promise<ItemTypeResponseDto> {
    const itemType = await this.itemTypeRepository.findById(id);

    if (!itemType) {
      throw new NotFoundException('Tipo de ítem no encontrado.');
    }

    return ItemTypeMapper.toResponse(itemType);
  }

  async findByCode(code: string): Promise<ItemTypeResponseDto | null> {
    const normalizedCode = normalizeCode(code);

    const itemType = await this.itemTypeRepository.findByCode(normalizedCode);

    if (!itemType) {
      return null;
    }

    return ItemTypeMapper.toResponse(itemType);
  }
}
