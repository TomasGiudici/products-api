import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { ItemTypeResponseDto } from './dto/item-type-response.dto';
import { ItemTypeService } from './item-type.service';

@Controller('item-types')
export class ItemTypeController {
  constructor(private readonly itemTypeService: ItemTypeService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  create(
    @Body() createItemTypeDto: CreateItemTypeDto,
  ): Promise<ItemTypeResponseDto> {
    return this.itemTypeService.create(createItemTypeDto);
  }

  @Get()
  findAll(): Promise<ItemTypeResponseDto[]> {
    return this.itemTypeService.findAll();
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ItemTypeResponseDto> {
    return this.itemTypeService.findById(id);
  }
}
