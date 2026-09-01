import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
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
import {
  PaginatedItemSummariesResponseDto,
  PaginatedItemsResponseDto,
} from './dto/paginated-items-response.dto';
import { FindItemByEanDto } from './dto/find-item-by-ean.dto';
import { FindItemByIdDto } from './dto/find-item-by-id.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemSummaryResponseDto } from './dto/item-summary-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import type { ItemDetail } from './interface/item-detail.interface';
import { ItemMapper } from './mapper/item.mapper';
import type { IItemRepository } from './repository/item.repository.interface';
import { ItemCsvExporter } from './exporter/item-csv.exporter';
import type { FindItemsFilters } from './repository/item.repository.interface';
import {
  ImportItemsMode,
  ImportItemsQueryDto,
} from './dto/import-items-query.dto';
import {
  ImportItemsErrorDto,
  ImportItemsResponseDto,
} from './dto/import-items-response.dto';
import { ItemImportFileParser } from './importer/item-import-file.parser';
import type {
  ImportItemData,
  RawImportItemRow,
} from './interface/import-item-data.interface';
import { normalizeText } from '../common/utils/normalize-text.util';
import { SearchItemsQueryDto } from './dto/search-items-query.dto';
import { SearchItemsByCandidatesDto } from './dto/search-items-by-candidates.dto';
import { RepositoryUniqueConstraintError } from '../common/errors/repository.errors';

interface ImportRelationIds {
  itemTypeId?: number;
  brandId?: number;
  categoryId?: number;
  unitId?: number;
}

interface ImportRelationCache {
  itemTypes: Map<string, ItemTypeResponseDto | null>;
  brands: Map<string, BrandResponseDto | null>;
  categories: Map<string, CategoryResponseDto | null>;
  units: Map<string, UnitOfMeasureResponseDto | null>;
}

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);
  private static readonly ITEMS_PAGE_SIZE = 50;
  private static readonly CSV_BATCH_SIZE = 500;
  private static readonly IMPORT_BATCH_SIZE = 500;
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
    registrationId?: string,
  ): Promise<ItemResponseDto> {
    const createData = ItemMapper.toCreateData(createItemDto);
    const logContext = {
      registrationId: this.normalizeRegistrationId(registrationId),
      ean: createData.ean,
    };
    this.logger.log({
      event: 'catalog-item-registration-started',
      ...logContext,
    });

    const existingItem = await this.itemRepository.findByEan(createData.ean);

    if (existingItem) {
      this.logger.warn({
        event: 'catalog-item-registration-already-exists',
        ...logContext,
      });
      throw new ConflictException('Ya existe un ítem registrado con ese EAN.');
    }

    const itemType = createData.itemTypeCode
      ? await this.itemTypeService.findByCode(createData.itemTypeCode)
      : null;

    if (createData.itemTypeCode && !itemType) {
      throw new BadRequestException('El tipo de ítem indicado no existe.');
    }

    if (
      createData.brandId !== undefined &&
      createData.brandName !== undefined
    ) {
      throw new BadRequestException(
        'No puede indicar brandId y brandName juntos.',
      );
    }

    let brand: BrandResponseDto | null = null;
    if (createData.brandId !== undefined) {
      try {
        brand = await this.brandService.findById(createData.brandId);
      } catch (error: unknown) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException('La marca indicada no existe.');
        }
        throw error;
      }
    } else if (createData.brandName) {
      brand = await this.brandService.resolveOrCreateByName(
        createData.brandName,
      );
    }

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
      const response = await this.buildResponse(createdItem);
      this.logger.log({
        event: 'catalog-item-registration-completed',
        ...logContext,
      });
      return response;
    } catch (error: unknown) {
      if (imagePath) {
        await this.storageService.deleteItemImage(imagePath);
      }

      if (error instanceof RepositoryUniqueConstraintError) {
        this.logger.warn({
          event: 'catalog-item-registration-race',
          ...logContext,
        });
        throw new ConflictException(
          'Ya existe un ítem registrado con ese EAN.',
        );
      }

      this.logger.error({
        event: 'catalog-item-registration-failed',
        error: error instanceof Error ? error.message : 'unknown',
        ...logContext,
      });
      throw error;
    }
  }

  private normalizeRegistrationId(registrationId?: string): string {
    return registrationId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        registrationId,
      )
      ? registrationId
      : 'untracked';
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

  async findAll(
    filterItemsDto: FilterItemsDto,
  ): Promise<PaginatedItemsResponseDto> {
    const filterData = ItemMapper.toFilterData(filterItemsDto);
    const repositoryFilters = await this.buildRepositoryFilters(filterItemsDto);

    if (!repositoryFilters) {
      return this.emptyPaginatedResponse(filterData.page);
    }

    const limit = ItemService.ITEMS_PAGE_SIZE;
    const skip = (filterData.page - 1) * limit;

    const result = await this.itemRepository.findMany(repositoryFilters, {
      skip,
      take: limit,
    });

    const data = await Promise.all(
      result.items.map((item) => this.buildResponse(item)),
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      data,
      meta: {
        page: filterData.page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: filterData.page < totalPages,
        hasPreviousPage: filterData.page > 1,
      },
    };
  }

  async search(
    searchItemsQueryDto: SearchItemsQueryDto,
  ): Promise<PaginatedItemSummariesResponseDto> {
    const normalizedName = normalizeText(searchItemsQueryDto.query);

    if (normalizedName.length < 2) {
      throw new BadRequestException(
        'query debe contener al menos 2 caracteres útiles.',
      );
    }

    const { page, limit } = searchItemsQueryDto;
    const result = await this.itemRepository.searchByNormalizedName(
      normalizedName,
      {
        skip: (page - 1) * limit,
        take: limit,
      },
    );
    const totalPages = Math.ceil(result.total / limit);

    return {
      data: result.items.map((item) =>
        ItemMapper.toSummaryResponse(
          item,
          {
            brand: item.brandName === null ? null : { name: item.brandName },
          },
          {
            imageUrl: this.storageService.getPublicItemImageUrl(item.imagePath),
          },
        ),
      ),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async searchByCandidates(
    dto: SearchItemsByCandidatesDto,
  ): Promise<PaginatedItemSummariesResponseDto> {
    const normalizedName = normalizeText(dto.query);

    if (normalizedName.length < 2) {
      throw new BadRequestException(
        'query debe contener al menos 2 caracteres Ãºtiles.',
      );
    }

    if (dto.eans.length === 0) {
      return this.emptyItemSummarySearch(dto.page, dto.limit);
    }

    const result = await this.itemRepository.searchByCandidateEans(
      normalizedName,
      Array.from(new Set(dto.eans)),
      {
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      },
    );

    return this.toPaginatedItemSummaryResponse(result, dto.page, dto.limit);
  }

  private emptyItemSummarySearch(
    page: number,
    limit: number,
  ): PaginatedItemSummariesResponseDto {
    return {
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: page > 1,
      },
    };
  }

  private toPaginatedItemSummaryResponse(
    result: Awaited<ReturnType<IItemRepository['searchByCandidateEans']>>,
    page: number,
    limit: number,
  ): PaginatedItemSummariesResponseDto {
    const totalPages = Math.ceil(result.total / limit);

    return {
      data: result.items.map((item) =>
        ItemMapper.toSummaryResponse(
          item,
          {
            brand: item.brandName === null ? null : { name: item.brandName },
          },
          {
            imageUrl: this.storageService.getPublicItemImageUrl(item.imagePath),
          },
        ),
      ),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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

    return ItemMapper.toSummaryResponse(
      item,
      { brand },
      {
        imageUrl: this.storageService.getPublicItemImageUrl(item.imagePath),
      },
    );
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

    const imageUrl = this.storageService.getPublicItemImageUrl(item.imagePath);

    return ItemMapper.toResponse(
      item,
      {
        itemType,
        brand,
        category,
        unit,
      },
      {
        imageUrl,
      },
    );
  }

  private emptyPaginatedResponse(page: number): PaginatedItemsResponseDto {
    return {
      data: [],
      meta: {
        page,
        limit: ItemService.ITEMS_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: page > 1,
      },
    };
  }

  async *exportAsCsv(filterItemsDto: FilterItemsDto): AsyncGenerator<string> {
    const repositoryFilters = await this.buildRepositoryFilters(filterItemsDto);

    yield `${ItemCsvExporter.headers()}\r\n`;

    if (!repositoryFilters) {
      return;
    }

    let page = 1;

    while (true) {
      const skip = (page - 1) * ItemService.CSV_BATCH_SIZE;

      const items = await this.itemRepository.findExportBatch(
        repositoryFilters,
        {
          skip,
          take: ItemService.CSV_BATCH_SIZE,
        },
      );

      if (items.length === 0) {
        break;
      }

      const responseItems = await Promise.all(
        items.map((item) => this.buildResponse(item)),
      );

      yield `${ItemCsvExporter.rows(responseItems)}\r\n`;

      if (items.length < ItemService.CSV_BATCH_SIZE) {
        break;
      }

      page++;
    }
  }

  private async buildRepositoryFilters(
    filterItemsDto: FilterItemsDto,
  ): Promise<FindItemsFilters | null> {
    const filterData = ItemMapper.toFilterData(filterItemsDto);

    if (filterData.search && !filterData.normalizedSearch) {
      return null;
    }

    const brand = filterData.brandName
      ? await this.brandService.findByName(filterData.brandName)
      : null;

    if (filterData.brandName && !brand) {
      return null;
    }

    const category = filterData.categoryName
      ? await this.categoryService.findByName(filterData.categoryName)
      : null;

    if (filterData.categoryName && !category) {
      return null;
    }

    return {
      brand_id: brand?.id,
      category_id: category?.id,
      normalized_name: filterData.normalizedSearch,
    };
  }

  async importItems(
    importItemsQueryDto: ImportItemsQueryDto,
    file?: Express.Multer.File,
  ): Promise<ImportItemsResponseDto> {
    if (!file) {
      throw new BadRequestException('Debe enviar un archivo en el campo file.');
    }

    const mode = importItemsQueryDto.mode ?? ImportItemsMode.UPSERT;
    const rawRows = ItemImportFileParser.parse(file);

    const result: ImportItemsResponseDto = {
      mode,
      totalRows: rawRows.length,
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    const rowsToImport: ImportItemData[] = [];
    const seenEans = new Set<string>();

    for (const rawRow of rawRows) {
      const parsedRow = this.parseImportRow(rawRow);

      if (parsedRow.error) {
        this.addImportError(result, parsedRow.error);
        continue;
      }

      const itemData = parsedRow.data;

      if (!itemData) {
        continue;
      }

      if (seenEans.has(itemData.ean)) {
        this.addImportError(result, {
          row: itemData.row,
          ean: itemData.ean,
          message: 'EAN duplicado dentro del archivo.',
        });

        continue;
      }

      seenEans.add(itemData.ean);
      rowsToImport.push(itemData);
    }

    const relationCache = this.createImportRelationCache();

    for (
      let index = 0;
      index < rowsToImport.length;
      index += ItemService.IMPORT_BATCH_SIZE
    ) {
      const batch = rowsToImport.slice(
        index,
        index + ItemService.IMPORT_BATCH_SIZE,
      );

      await this.processImportBatch(batch, mode, result, relationCache);
    }

    result.processed = result.created + result.updated;
    result.failed = result.errors.length;

    return result;
  }

  private async processImportBatch(
    rows: ImportItemData[],
    mode: ImportItemsMode,
    result: ImportItemsResponseDto,
    relationCache: ImportRelationCache,
  ): Promise<void> {
    const eans = rows.map((row) => row.ean);

    const existingItems = await this.itemRepository.findByEans(eans);

    const existingItemsByEan = new Map(
      existingItems.map((item) => [item.ean, item]),
    );

    for (const row of rows) {
      try {
        const existingItem = existingItemsByEan.get(row.ean);

        if (mode === ImportItemsMode.CREATE_ONLY && existingItem) {
          this.addImportError(result, {
            row: row.row,
            ean: row.ean,
            message: 'Ya existe un ítem registrado con ese EAN.',
          });

          continue;
        }

        const relationIds = await this.resolveImportRelations(
          row,
          relationCache,
        );

        if (existingItem) {
          const updateData = ItemMapper.toUpdateDataFromImport(row);

          const persistenceData = ItemMapper.toUpdatePersistence(
            updateData,
            relationIds,
          );

          await this.itemRepository.updateById(
            existingItem.id,
            persistenceData,
          );

          result.updated++;
          continue;
        }

        const createData = ItemMapper.toCreateDataFromImport(row);

        const persistenceData = ItemMapper.toCreatePersistence(
          createData,
          relationIds,
        );

        await this.itemRepository.create(persistenceData);

        result.created++;
      } catch (error: unknown) {
        this.addImportError(result, {
          row: row.row,
          ean: row.ean,
          message: this.getImportErrorMessage(error),
        });
      }
    }
  }

  private async resolveImportRelations(
    itemData: ImportItemData,
    cache: ImportRelationCache,
  ): Promise<ImportRelationIds> {
    const itemType = itemData.itemTypeCode
      ? await this.getCached(cache.itemTypes, itemData.itemTypeCode, () =>
          this.itemTypeService.findByCode(itemData.itemTypeCode!),
        )
      : null;

    if (itemData.itemTypeCode && !itemType) {
      throw new BadRequestException('El tipo de ítem indicado no existe.');
    }

    const brand = itemData.brandName
      ? await this.getCached(cache.brands, itemData.brandName, () =>
          this.brandService.resolveOrCreateByName(itemData.brandName!),
        )
      : null;

    const category = itemData.categoryName
      ? await this.getCached(cache.categories, itemData.categoryName, () =>
          this.categoryService.findByName(itemData.categoryName!),
        )
      : null;

    if (itemData.categoryName && !category) {
      throw new BadRequestException('La categoría indicada no existe.');
    }

    const unit = itemData.unitAbbreviation
      ? await this.getCached(cache.units, itemData.unitAbbreviation, () =>
          this.unitOfMeasureService.findByAbbreviation(
            itemData.unitAbbreviation!,
          ),
        )
      : null;

    if (itemData.unitAbbreviation && !unit) {
      throw new BadRequestException('La unidad de medida indicada no existe.');
    }

    return {
      itemTypeId: itemType?.id,
      brandId: brand?.id,
      categoryId: category?.id,
      unitId: unit?.id,
    };
  }

  private createImportRelationCache(): ImportRelationCache {
    return {
      itemTypes: new Map<string, ItemTypeResponseDto | null>(),
      brands: new Map<string, BrandResponseDto | null>(),
      categories: new Map<string, CategoryResponseDto | null>(),
      units: new Map<string, UnitOfMeasureResponseDto | null>(),
    };
  }

  private async getCached<T>(
    cache: Map<string, T | null>,
    key: string,
    loader: () => Promise<T | null>,
  ): Promise<T | null> {
    const normalizedKey = key.trim().toLowerCase();

    if (cache.has(normalizedKey)) {
      return cache.get(normalizedKey) ?? null;
    }

    const value = await loader();

    cache.set(normalizedKey, value);

    return value;
  }

  private parseImportRow(rawRow: RawImportItemRow): {
    data?: ImportItemData;
    error?: ImportItemsErrorDto;
  } {
    const errors: string[] = [];
    const rowNumber = rawRow.__rowNumber;

    const ean = this.getOptionalStringCell(rawRow, 'ean');

    if (!ean) {
      errors.push('ean es obligatorio.');
    } else if (!/^\d{13}$/.test(ean)) {
      errors.push('ean debe contener exactamente 13 dígitos.');
    }

    const name = this.getOptionalStringCell(rawRow, 'name');

    if (!name) {
      errors.push('name es obligatorio.');
    } else if (name.length > 255) {
      errors.push('name no puede superar los 255 caracteres.');
    }

    const itemTypeCode = this.getOptionalStringCell(rawRow, 'itemTypeCode');
    this.validateMaxLength(itemTypeCode, 'itemTypeCode', 50, errors);

    const description = this.getOptionalStringCell(rawRow, 'description');
    this.validateMaxLength(description, 'description', 1000, errors);

    const brandName = this.getOptionalStringCell(rawRow, 'brandName');
    this.validateMaxLength(brandName, 'brandName', 100, errors);

    const categoryName = this.getOptionalStringCell(rawRow, 'categoryName');
    this.validateMaxLength(categoryName, 'categoryName', 100, errors);

    const unitAbbreviation = this.getOptionalStringCell(
      rawRow,
      'unitAbbreviation',
    );
    this.validateMaxLength(unitAbbreviation, 'unitAbbreviation', 10, errors);

    const quantity = this.getOptionalNumberCell(rawRow, 'quantity', errors);

    const unitsPerPack = this.getOptionalIntegerCell(
      rawRow,
      'unitsPerPack',
      errors,
    );

    const dimensions = this.getOptionalDimensions(rawRow, errors);

    const metadata = this.getOptionalMetadata(rawRow, errors);

    if (errors.length > 0) {
      return {
        error: {
          row: rowNumber,
          ean: ean ?? null,
          message: errors.join(' '),
        },
      };
    }

    return {
      data: {
        row: rowNumber,
        ean: ean!,
        itemTypeCode,
        name: name!,
        description,
        brandName,
        categoryName,
        quantity,
        unitAbbreviation,
        unitsPerPack,
        dimensions,
        metadata,
      },
    };
  }

  private getOptionalDimensions(
    rawRow: RawImportItemRow,
    errors: string[],
  ): ImportItemData['dimensions'] {
    const width = this.getOptionalNumberCell(rawRow, 'dimensionsWidth', errors);
    const height = this.getOptionalNumberCell(
      rawRow,
      'dimensionsHeight',
      errors,
    );
    const depth = this.getOptionalNumberCell(rawRow, 'dimensionsDepth', errors);
    const unit = this.getOptionalStringCell(rawRow, 'dimensionsUnit');

    this.validateMaxLength(unit, 'dimensionsUnit', 10, errors);

    if (
      width === undefined &&
      height === undefined &&
      depth === undefined &&
      unit === undefined
    ) {
      return undefined;
    }

    return {
      width,
      height,
      depth,
      unit,
    };
  }

  private getOptionalMetadata(
    rawRow: RawImportItemRow,
    errors: string[],
  ): Record<string, unknown> | undefined {
    const metadataValue = this.getOptionalStringCell(rawRow, 'metadata');

    if (!metadataValue) {
      return undefined;
    }

    try {
      const parsedMetadata = JSON.parse(metadataValue) as unknown;

      if (
        parsedMetadata &&
        typeof parsedMetadata === 'object' &&
        !Array.isArray(parsedMetadata)
      ) {
        return parsedMetadata as Record<string, unknown>;
      }

      errors.push('metadata debe ser un objeto JSON válido.');

      return undefined;
    } catch {
      errors.push('metadata debe ser un JSON válido.');

      return undefined;
    }
  }

  private getOptionalNumberCell(
    rawRow: RawImportItemRow,
    columnName: string,
    errors: string[],
  ): number | undefined {
    const value = this.getOptionalStringCell(rawRow, columnName);

    if (value === undefined) {
      return undefined;
    }

    const normalizedValue = value.replace(',', '.');
    const numberValue = Number(normalizedValue);

    if (!Number.isFinite(numberValue)) {
      errors.push(`${columnName} debe ser un número válido.`);
      return undefined;
    }

    if (numberValue < 0) {
      errors.push(`${columnName} no puede ser negativo.`);
      return undefined;
    }

    return numberValue;
  }

  private getOptionalIntegerCell(
    rawRow: RawImportItemRow,
    columnName: string,
    errors: string[],
  ): number | undefined {
    const value = this.getOptionalStringCell(rawRow, columnName);

    if (value === undefined) {
      return undefined;
    }

    const numberValue = Number(value);

    if (!Number.isInteger(numberValue)) {
      errors.push(`${columnName} debe ser un número entero.`);
      return undefined;
    }

    if (numberValue < 1) {
      errors.push(`${columnName} debe ser mayor o igual a 1.`);
      return undefined;
    }

    return numberValue;
  }

  private getOptionalStringCell(
    rawRow: RawImportItemRow,
    columnName: string,
  ): string | undefined {
    const columnKey = Object.keys(rawRow).find(
      (key) =>
        this.normalizeColumnName(key) === this.normalizeColumnName(columnName),
    );

    if (!columnKey) {
      return undefined;
    }

    const value = rawRow[columnKey];

    if (value === null || value === undefined) {
      return undefined;
    }

    let stringValue: string;

    if (typeof value === 'string') {
      stringValue = value.trim();
    } else if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      stringValue = value.toString().trim();
    } else if (value instanceof Date) {
      stringValue = value.toISOString();
    } else {
      return undefined;
    }

    if (!stringValue) {
      return undefined;
    }

    return stringValue;
  }

  private normalizeColumnName(columnName: string): string {
    return columnName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private validateMaxLength(
    value: string | undefined,
    fieldName: string,
    maxLength: number,
    errors: string[],
  ): void {
    if (value !== undefined && value.length > maxLength) {
      errors.push(`${fieldName} no puede superar los ${maxLength} caracteres.`);
    }
  }

  private addImportError(
    result: ImportItemsResponseDto,
    error: ImportItemsErrorDto,
  ): void {
    result.errors.push(error);
    result.failed = result.errors.length;
  }

  private getImportErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Error desconocido al importar la fila.';
  }
}
