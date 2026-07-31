import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class FilterItemsDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'brandName no puede contener solo espacios.',
  })
  @MaxLength(100, {
    message: 'brandName no puede superar los 100 caracteres.',
  })
  brandName?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'categoryName no puede contener solo espacios.',
  })
  @MaxLength(100, {
    message: 'categoryName no puede superar los 100 caracteres.',
  })
  categoryName?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'search no puede contener solo espacios.',
  })
  @MaxLength(255, {
    message: 'search no puede superar los 255 caracteres.',
  })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero.' })
  @Min(1, { message: 'page debe ser mayor o igual a 1.' })
  page?: number;
}
