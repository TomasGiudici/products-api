import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BrandResponseDto } from '../brand/dto/brand-response.dto';
import { BrandService } from '../brand/brand.service';
import { CategoryResponseDto } from '../category/dto/category-response.dto';
import { CategoryService } from '../category/category.service';
import { ItemTypeResponseDto } from '../item-type/dto/item-type-response.dto';
import { ItemTypeService } from '../item-type/item-type.service';
import { StorageService } from '../storage/storage.service';
import { UnitOfMeasureResponseDto } from '../unit-of-measure/dto/unit-of-measure-response.dto';
import { UnitOfMeasureService } from '../unit-of-measure/unit-of-measure.service';
import { CreateItemDto } from './dto/create-item.dto';
import { FilterItemsDto } from './dto/filter-items.dto';
import { FindItemByEanDto } from './dto/find-item-by-ean.dto';
import { FindItemByIdDto } from './dto/find-item-by-id.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemSummaryResponseDto } from './dto/item-summary-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemCsvExporter } from './exporter/item-csv.exporter';
import type { ItemDetail } from './interface/item-detail.interface';
import { ItemMapper } from './mapper/item.mapper';
import type { IItemRepository } from './repository/item.repository.interface';

@Injectable()
export class ItemService {
  constructor(
    @Inject('itemRepository')
    private readonly itemRepository: IItemRepository,
    private readonly itemTypeService: ItemTypeService,
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    private readonly unitOfMeasureService: UnitOfMeasureService,
    private readonly storageService: StorageService,
  ) {}

  async createItem(
    createItemDto: CreateItemDto,
    image?: Express.Multer.File,
  ): Promise<ItemResponseDto> {
    const createData = ItemMapper.toCreateData(createItemDto);

    const existingItem = await this.itemRepository.findByEan(createData.ean);

    if (existingItem) {
      throw new ConflictException('Ya existe un ítem registrado con ese EAN.');
    }

    const itemType = createData.itemTypeCode
      ? await this.itemTypeService.findByCode(createData.itemTypeCode)
      : null;

    if (createData.itemTypeCode && !itemType) {
      throw new BadRequestException('El tipo de ítem indicado no existe.');
    }

    const brand = createData.brandName
      ? await this.brandService.resolveOrCreateByName(createData.brandName)
      : null;

    const category = createData.categoryName
      ? await this.categoryService.findByName(createData.categoryName)
      : null;

    if (createData.categoryName && !category) {
      throw new BadRequestException('La categoría indicada no existe.');
    }

    const unit = createData.unitAbbreviation
      ? await this.unitOfMeasureService.findByAbbreviation(
          createData.unitAbbreviation,
        )
      : null;

    if (createData.unitAbbreviation && !unit) {
      throw new BadRequestException('La unidad de medida indicada no existe.');
    }

    let imagePath: string | undefined;

    try {
      imagePath = image
        ? await this.storageService.uploadItemImage(createData.ean, image)
        : undefined;

      const persistenceData = ItemMapper.toCreatePersistence(
        createData,
        {
          itemTypeId: itemType?.id,
          brandId: brand?.id,
          categoryId: category?.id,
          unitId: unit?.id,
        },
        imagePath,
      );

      const createdItem = await this.itemRepository.create(persistenceData);

      return this.buildResponse(createdItem);
    } catch (error: unknown) {
      if (imagePath) {
        await this.storageService.deleteItemImage(imagePath);
      }

      throw error;
    }
  }

  async updateItem(
    findItemByIdDto: FindItemByIdDto,
    updateItemDto: UpdateItemDto,
    image?: Express.Multer.File,
  ): Promise<ItemResponseDto> {
    const existingItem = await this.itemRepository.findById(findItemByIdDto.id);

    if (!existingItem) {
      throw new NotFoundException('Ítem no encontrado.');
    }

    const updateData = ItemMapper.toUpdateData(updateItemDto);

    if (!ItemMapper.hasUpdateData(updateData) && !image) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para modificar.',
      );
    }

    const itemType = updateData.itemTypeCode
      ? await this.itemTypeService.findByCode(updateData.itemTypeCode)
      : null;

    if (updateData.itemTypeCode && !itemType) {
      throw new BadRequestException('El tipo de ítem indicado no existe.');
    }

    const brand = updateData.brandName
      ? await this.brandService.resolveOrCreateByName(updateData.brandName)
      : null;

    const category = updateData.categoryName
      ? await this.categoryService.findByName(updateData.categoryName)
      : null;

    if (updateData.categoryName && !category) {
      throw new BadRequestException('La categoría indicada no existe.');
    }

    const unit = updateData.unitAbbreviation
      ? await this.unitOfMeasureService.findByAbbreviation(
          updateData.unitAbbreviation,
        )
      : null;

    if (updateData.unitAbbreviation && !unit) {
      throw new BadRequestException('La unidad de medida indicada no existe.');
    }

    let newImagePath: string | undefined;

    try {
      newImagePath = image
        ? await this.storageService.uploadUpdatedItemImage(
            existingItem.ean,
            image,
          )
        : undefined;

      const persistenceData = ItemMapper.toUpdatePersistence(
        updateData,
        {
          itemTypeId: itemType?.id,
          brandId: brand?.id,
          categoryId: category?.id,
          unitId: unit?.id,
        },
        newImagePath,
      );

      const updatedItem = await this.itemRepository.updateById(
        existingItem.id,
        persistenceData,
      );

      if (newImagePath && existingItem.imagePath) {
        await this.storageService.deleteItemImage(existingItem.imagePath);
      }

      return this.buildResponse(updatedItem);
    } catch (error: unknown) {
      if (newImagePath) {
        await this.storageService.deleteItemImage(newImagePath);
      }

      throw error;
    }
  }

  async findAll(filterItemsDto: FilterItemsDto): Promise<ItemResponseDto[]> {
    const filterData = ItemMapper.toFilterData(filterItemsDto);

    if (filterData.search && !filterData.normalizedSearch) {
      return [];
    }

    const brand = filterData.brandName
      ? await this.brandService.findByName(filterData.brandName)
      : null;

    if (filterData.brandName && !brand) {
      return [];
    }

    const category = filterData.categoryName
      ? await this.categoryService.findByName(filterData.categoryName)
      : null;

    if (filterData.categoryName && !category) {
      return [];
    }

    const items = await this.itemRepository.findMany({
      brand_id: brand?.id,
      category_id: category?.id,
      normalized_name: filterData.normalizedSearch,
    });

    return Promise.all(items.map((item) => this.buildResponse(item)));
  }

  async findById(findItemByIdDto: FindItemByIdDto): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findById(findItemByIdDto.id);

    if (!item) {
      throw new NotFoundException('Ítem no encontrado.');
    }

    return this.buildResponse(item);
  }

  async findByEan(
    findItemByEanDto: FindItemByEanDto,
  ): Promise<ItemResponseDto> {
    const item = await this.findItemDetailByEan(findItemByEanDto);

    return this.buildResponse(item);
  }

  async findSummaryByEan(
    findItemByEanDto: FindItemByEanDto,
  ): Promise<ItemSummaryResponseDto> {
    const item = await this.findItemDetailByEan(findItemByEanDto);

    const brand: BrandResponseDto | null =
      item.brandId !== null
        ? await this.brandService.findById(item.brandId)
        : null;

    return ItemMapper.toSummaryResponse(item, {
      brand,
    });
  }

  async findAllAsCsv(filterItemsDto: FilterItemsDto): Promise<string> {
    const items = await this.findAll(filterItemsDto);

    return ItemCsvExporter.export(items);
  }

  private async findItemDetailByEan(
    findItemByEanDto: FindItemByEanDto,
  ): Promise<ItemDetail> {
    const item = await this.itemRepository.findByEan(findItemByEanDto.ean);

    if (!item) {
      throw new NotFoundException('Ítem no encontrado.');
    }

    return item;
  }

  private async buildResponse(item: ItemDetail): Promise<ItemResponseDto> {
    const itemType: ItemTypeResponseDto | null =
      item.itemTypeId !== null
        ? await this.itemTypeService.findById(item.itemTypeId)
        : null;

    const brand: BrandResponseDto | null =
      item.brandId !== null
        ? await this.brandService.findById(item.brandId)
        : null;

    const category: CategoryResponseDto | null =
      item.categoryId !== null
        ? await this.categoryService.findById(item.categoryId)
        : null;

    const unit: UnitOfMeasureResponseDto | null =
      item.unitId !== null
        ? await this.unitOfMeasureService.findById(item.unitId)
        : null;

    return ItemMapper.toResponse(item, {
      itemType,
      brand,
      category,
      unit,
    });
  }
}
