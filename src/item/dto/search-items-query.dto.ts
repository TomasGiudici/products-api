import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchItemsQueryDto {
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'query debe ser un texto.' })
  @MinLength(2, { message: 'query debe tener al menos 2 caracteres.' })
  @MaxLength(255, {
    message: 'query no puede superar los 255 caracteres.',
  })
  query!: string;

  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero.' })
  @Min(1, { message: 'page debe ser mayor o igual a 1.' })
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero.' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1.' })
  @Max(50, { message: 'limit no puede superar 50.' })
  limit: number = 20;
}
