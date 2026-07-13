import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UnitOfMeasureResponseDto } from './dto/unit-of-measure-response.dto';
import { UnitOfMeasureService } from './unit-of-measure.service';

@Controller('unit-of-measure')
export class UnitOfMeasureController {
  constructor(private readonly unitOfMeasureService: UnitOfMeasureService) {}

  @Post()
  create(
    @Body() createUnitOfMeasureDto: CreateUnitOfMeasureDto,
  ): Promise<UnitOfMeasureResponseDto> {
    return this.unitOfMeasureService.createUnitOfMeasure(
      createUnitOfMeasureDto,
    );
  }

  @Get()
  findAll(): Promise<UnitOfMeasureResponseDto[]> {
    return this.unitOfMeasureService.findAll();
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UnitOfMeasureResponseDto> {
    return this.unitOfMeasureService.findById(id);
  }
}
