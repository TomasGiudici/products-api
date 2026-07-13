import { normalizeText } from '../../common/utils/normalize-text.util';
import type { category as Category } from '../../generated/prisma/client';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateCategoryPersistenceData } from '../repository/category.repository.interface';

export class CategoryMapper {
  static toPersistence(
    createCategoryDto: CreateCategoryDto,
  ): CreateCategoryPersistenceData {
    const name = createCategoryDto.name.trim();

    return {
      name,
      normalized_name: normalizeText(name),
    };
  }

  static toResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
    };
  }

  static toResponseList(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => this.toResponse(category));
  }
}
