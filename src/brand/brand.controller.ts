import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { BrandService } from './brand.service';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { SearchBrandsQueryDto } from './dto/search-brands-query.dto';
import { BrandReferenceDto } from './dto/brand-reference.dto';

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

  @Get('search')
  search(@Query() query: SearchBrandsQueryDto): Promise<BrandResponseDto[]> {
    return this.brandService.search(query.query);
  }

  @Post('resolve')
  @UseGuards(ApiKeyGuard)
  resolve(@Body() dto: CreateBrandDto): Promise<BrandReferenceDto> {
    return this.brandService.createOrResolve(dto);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<BrandResponseDto> {
    return this.brandService.findById(id);
  }
}
