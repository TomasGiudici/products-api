import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { FindItemByIdDto } from './dto/find-item-by-id.dto';
import { FindItemByIdentifierDto } from './dto/find-item-by-identifier.dto';
import { ItemResponseDto } from './dto/item-response.dto';
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
}
