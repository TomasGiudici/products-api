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
import { CreateIdentifierTypeDto } from './dto/create-identifier-type.dto';
import { IdentifierTypeResponseDto } from './dto/identifier-type-response.dto';
import { IdentifierTypeService } from './identifier-type.service';

@Controller('identifier-types')
export class IdentifierTypeController {
  constructor(private readonly identifierTypeService: IdentifierTypeService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  create(
    @Body()
    createIdentifierTypeDto: CreateIdentifierTypeDto,
  ): Promise<IdentifierTypeResponseDto> {
    return this.identifierTypeService.create(createIdentifierTypeDto);
  }

  @Get()
  findAll(): Promise<IdentifierTypeResponseDto[]> {
    return this.identifierTypeService.findAll();
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IdentifierTypeResponseDto> {
    return this.identifierTypeService.findById(id);
  }
}
