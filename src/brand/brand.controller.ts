import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    return this.brandService.createBrand(createBrandDto);
  }

  @Get()
  findAll(): Promise<BrandResponseDto[]> {
    return this.brandService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<BrandResponseDto> {
    return this.brandService.findById(id);
  }
}
