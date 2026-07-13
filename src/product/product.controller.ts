import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductByEanDto } from './dto/find-product-by-ean.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.productService.createProduct(createProductDto, image);
  }

  @Get('ean/:ean')
  findByEan(
    @Param() findProductByEanDto: FindProductByEanDto,
  ): Promise<ProductResponseDto> {
    return this.productService.findProductByEan(findProductByEanDto);
  }
}
