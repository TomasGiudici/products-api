import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { StorageService } from '../storage/storage.service';
import { UnitOfMeasureService } from '../unit-of-measure/unit-of-measure.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductByEanDto } from './dto/find-product-by-ean.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductMapper } from './mapper/product.mapper';
import type { IProductRepository } from './repository/product.repository.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject('productRepository')
    private readonly productRepository: IProductRepository,
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    private readonly unitOfMeasureService: UnitOfMeasureService,
    private readonly storageService: StorageService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const createData = ProductMapper.toCreateData(createProductDto);

    const existingProduct = await this.productRepository.findByEan(
      createData.ean,
    );

    if (existingProduct) {
      throw new ConflictException(
        'Ya existe un producto registrado con el EAN proporcionado.',
      );
    }

    const brand = await this.brandService.resolveOrCreateByName(
      createData.brandName,
    );

    const category = await this.categoryService.findByName(
      createData.categoryName,
    );

    if (!category) {
      throw new BadRequestException('La categoría indicada no existe.');
    }

    const unit = createData.unitAbbreviation
      ? await this.unitOfMeasureService.findByAbbreviation(
          createData.unitAbbreviation,
        )
      : null;

    if (createData.unitAbbreviation && !unit) {
      throw new BadRequestException('La unidad de medida indicada no existe.');
    }

    let imagePath: string | undefined;

    try {
      imagePath = image
        ? await this.storageService.uploadProductImage(createData.ean, image)
        : undefined;

      const persistenceData = ProductMapper.toCreatePersistence(
        createData,
        {
          brandId: brand.id,
          categoryId: category.id,
          unitId: unit?.id,
        },
        imagePath,
      );

      const createdProduct =
        await this.productRepository.create(persistenceData);

      return ProductMapper.toResponse(createdProduct);
    } catch (error: unknown) {
      if (imagePath) {
        await this.storageService.deleteProductImage(imagePath);
      }

      throw error;
    }
  }

  async updateProduct(
    findProductByEanDto: FindProductByEanDto,
    updateProductDto: UpdateProductDto,
    image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const ean = ProductMapper.toEan(findProductByEanDto);

    const existingProduct = await this.productRepository.findByEan(ean);

    if (!existingProduct) {
      throw new NotFoundException(
        'No se encontró un producto para el EAN proporcionado.',
      );
    }

    const updateData = ProductMapper.toUpdateData(updateProductDto);

    if (!ProductMapper.hasUpdateData(updateData) && !image) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para modificar.',
      );
    }

    const brand = updateData.brandName
      ? await this.brandService.resolveOrCreateByName(updateData.brandName)
      : null;

    const category = updateData.categoryName
      ? await this.categoryService.findByName(updateData.categoryName)
      : null;

    if (updateData.categoryName && !category) {
      throw new BadRequestException('La categoría indicada no existe.');
    }

    const unit = updateData.unitAbbreviation
      ? await this.unitOfMeasureService.findByAbbreviation(
          updateData.unitAbbreviation,
        )
      : null;

    if (updateData.unitAbbreviation && !unit) {
      throw new BadRequestException('La unidad de medida indicada no existe.');
    }

    let newImagePath: string | undefined;

    try {
      newImagePath = image
        ? await this.storageService.uploadUpdatedProductImage(ean, image)
        : undefined;

      const persistenceData = ProductMapper.toUpdatePersistence(
        updateData,
        {
          brandId: brand?.id,
          categoryId: category?.id,
          unitId: unit?.id,
        },
        newImagePath,
      );

      const updatedProduct = await this.productRepository.updateByEan(
        ean,
        persistenceData,
      );

      if (newImagePath && existingProduct.imagePath) {
        await this.storageService.deleteProductImage(existingProduct.imagePath);
      }

      return ProductMapper.toResponse(updatedProduct);
    } catch (error: unknown) {
      if (newImagePath) {
        await this.storageService.deleteProductImage(newImagePath);
      }

      throw error;
    }
  }

  async findProductByEan(
    findProductByEanDto: FindProductByEanDto,
  ): Promise<ProductResponseDto> {
    const ean = ProductMapper.toEan(findProductByEanDto);

    const product = await this.productRepository.findByEan(ean);

    if (!product) {
      throw new NotFoundException(
        'No se encontró un producto para el EAN proporcionado.',
      );
    }

    return ProductMapper.toResponse(product);
  }
}
