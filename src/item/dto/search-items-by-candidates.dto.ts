import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchItemsByCandidatesDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'query debe ser un texto.' })
  @MinLength(2, { message: 'query debe tener al menos 2 caracteres.' })
  @MaxLength(255, {
    message: 'query no puede superar los 255 caracteres.',
  })
  query!: string;

  @IsArray({ message: 'eans debe ser un array.' })
  @ArrayNotEmpty({ message: 'eans no puede estar vacÃ­o.' })
  @IsString({ each: true, message: 'Cada EAN debe ser un texto.' })
  @Matches(/^\d{13}$/, {
    each: true,
    message: 'Cada EAN debe contener exactamente 13 dÃ­gitos.',
  })
  eans!: string[];

  @Type(() => Number)
  @IsInt({ message: 'page debe ser un nÃºmero entero.' })
  @Min(1, { message: 'page debe ser mayor o igual a 1.' })
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un nÃºmero entero.' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1.' })
  @Max(50, { message: 'limit no puede superar 50.' })
  limit: number = 20;
}
