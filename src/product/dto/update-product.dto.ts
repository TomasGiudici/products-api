import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'name no puede estar vacío.',
  })
  @Matches(/\S/, {
    message: 'name no puede contener solo espacios.',
  })
  @MaxLength(255, {
    message: 'name no puede superar los 255 caracteres.',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'brandName no puede estar vacío.',
  })
  @Matches(/\S/, {
    message: 'brandName no puede contener solo espacios.',
  })
  @MaxLength(100, {
    message: 'brandName no puede superar los 100 caracteres.',
  })
  brandName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'categoryName no puede estar vacío.',
  })
  @Matches(/\S/, {
    message: 'categoryName no puede contener solo espacios.',
  })
  @MaxLength(100, {
    message: 'categoryName no puede superar los 100 caracteres.',
  })
  categoryName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'quantity debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'quantity no puede ser negativo.',
  })
  quantity?: number;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'unitAbbreviation no puede contener solo espacios.',
  })
  @MaxLength(10, {
    message: 'unitAbbreviation no puede superar los 10 caracteres.',
  })
  unitAbbreviation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'unitsPerPack debe ser un número entero.',
  })
  @Min(1, {
    message: 'unitsPerPack debe ser mayor a cero.',
  })
  unitsPerPack?: number;
}
