import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Res,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { FilterItemsDto } from './dto/filter-items.dto';
import { FindItemByEanDto } from './dto/find-item-by-ean.dto';
import { FindItemByIdDto } from './dto/find-item-by-id.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemSummaryResponseDto } from './dto/item-summary-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemService } from './item.service';
import {
  PaginatedItemSummariesResponseDto,
  PaginatedItemsResponseDto,
} from './dto/paginated-items-response.dto';
import { ImportItemsQueryDto } from './dto/import-items-query.dto';
import { ImportItemsResponseDto } from './dto/import-items-response.dto';
import { SearchItemsQueryDto } from './dto/search-items-query.dto';
import { SearchItemsByCandidatesDto } from './dto/search-items-by-candidates.dto';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ItemResponseDto> {
    return this.itemService.createItem(createItemDto, image);
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param() findItemByIdDto: FindItemByIdDto,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ItemResponseDto> {
    return this.itemService.updateItem(findItemByIdDto, updateItemDto, image);
  }

  @Get('export')
  @UseGuards(ApiKeyGuard)
  async exportCsv(
    @Query() filterItemsDto: FilterItemsDto,
    @Res() response: Response,
  ): Promise<void> {
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="items.csv"',
    );

    for await (const chunk of this.itemService.exportAsCsv(filterItemsDto)) {
      await this.writeChunk(response, chunk);
    }

    response.end();
  }

  @Get()
  findAll(
    @Query() filterItemsDto: FilterItemsDto,
  ): Promise<PaginatedItemsResponseDto> {
    return this.itemService.findAll(filterItemsDto);
  }

  @Get('search')
  search(
    @Query() searchItemsQueryDto: SearchItemsQueryDto,
  ): Promise<PaginatedItemSummariesResponseDto> {
    return this.itemService.search(searchItemsQueryDto);
  }

  @Post('search/candidates')
  searchByCandidates(
    @Body() dto: SearchItemsByCandidatesDto,
  ): Promise<PaginatedItemSummariesResponseDto> {
    return this.itemService.searchByCandidates(dto);
  }

  @Get('ean/:ean/summary')
  findSummaryByEan(
    @Param() findItemByEanDto: FindItemByEanDto,
  ): Promise<ItemSummaryResponseDto> {
    return this.itemService.findSummaryByEan(findItemByEanDto);
  }

  @Get('ean/:ean')
  findByEan(
    @Param() findItemByEanDto: FindItemByEanDto,
  ): Promise<ItemResponseDto> {
    return this.itemService.findByEan(findItemByEanDto);
  }

  @Get(':id')
  findById(
    @Param() findItemByIdDto: FindItemByIdDto,
  ): Promise<ItemResponseDto> {
    return this.itemService.findById(findItemByIdDto);
  }

  private async writeChunk(response: Response, chunk: string): Promise<void> {
    if (response.write(chunk)) {
      return;
    }

    await new Promise<void>((resolve) => {
      response.once('drain', resolve);
    });
  }

  @Post('import')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  importItems(
    @Query() importItemsQueryDto: ImportItemsQueryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ImportItemsResponseDto> {
    return this.itemService.importItems(importItemsQueryDto, file);
  }
}
