import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
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
import { FindItemByIdDto } from './dto/find-item-by-id.dto';
import { FindItemByIdentifierDto } from './dto/find-item-by-identifier.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemSummaryResponseDto } from './dto/item-summary-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemService } from './item.service';

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

  @Get()
  async findAll(
    @Query() filterItemsDto: FilterItemsDto,
    @Headers('accept') acceptHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ItemResponseDto[] | string> {
    response.setHeader('Vary', 'Accept');

    if (this.acceptsCsv(acceptHeader)) {
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader(
        'Content-Disposition',
        'attachment; filename="items.csv"',
      );

      return this.itemService.findAllAsCsv(filterItemsDto);
    }

    response.setHeader('Content-Type', 'application/json; charset=utf-8');

    return this.itemService.findAll(filterItemsDto);
  }

  @Get('identifier/:identifierTypeCode/:identifierValue/summary')
  findSummaryByIdentifier(
    @Param()
    findItemByIdentifierDto: FindItemByIdentifierDto,
  ): Promise<ItemSummaryResponseDto> {
    return this.itemService.findSummaryByIdentifier(findItemByIdentifierDto);
  }

  @Get('identifier/:identifierTypeCode/:identifierValue')
  findByIdentifier(
    @Param()
    findItemByIdentifierDto: FindItemByIdentifierDto,
  ): Promise<ItemResponseDto> {
    return this.itemService.findByIdentifier(findItemByIdentifierDto);
  }

  @Get(':id')
  findById(
    @Param() findItemByIdDto: FindItemByIdDto,
  ): Promise<ItemResponseDto> {
    return this.itemService.findById(findItemByIdDto);
  }

  private acceptsCsv(acceptHeader: string | undefined): boolean {
    if (!acceptHeader) {
      return false;
    }

    return acceptHeader
      .toLowerCase()
      .split(',')
      .map((value) => value.split(';')[0].trim())
      .includes('text/csv');
  }
}
