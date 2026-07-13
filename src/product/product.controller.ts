import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductByEanDto } from './dto/find-product-by-ean.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductService } from './product.service';
import { ApiKeyGuard } from '../common/utils/guards/api-key.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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

  @Patch('ean/:ean')
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
    @Param() findProductByEanDto: FindProductByEanDto,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(
      findProductByEanDto,
      updateProductDto,
      image,
    );
  }
}
