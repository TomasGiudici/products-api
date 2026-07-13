import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { normalizeText } from '../common/utils/normalize-text.util';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryMapper } from './mapper/category.mapper';
import type { ICategoryRepository } from './repository/category.repository.interface';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('categoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const persistenceData = CategoryMapper.toPersistence(createCategoryDto);

    const existingCategory = await this.categoryRepository.findByNormalizedName(
      persistenceData.normalized_name,
    );

    if (existingCategory) {
      throw new ConflictException(
        'Ya existe una categoría equivalente registrada.',
      );
    }

    const createdCategory =
      await this.categoryRepository.create(persistenceData);

    return CategoryMapper.toResponse(createdCategory);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll();

    return CategoryMapper.toResponseList(categories);
  }

  async findById(id: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    return CategoryMapper.toResponse(category);
  }

  async findByName(name: string): Promise<CategoryResponseDto | null> {
    const category = await this.categoryRepository.findByNormalizedName(
      normalizeText(name),
    );

    if (!category) {
      return null;
    }

    return CategoryMapper.toResponse(category);
  }
}
