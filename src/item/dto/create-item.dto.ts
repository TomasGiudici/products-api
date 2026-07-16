import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ItemDimensionsDto } from './item-dimensions.dto';

export class CreateItemDto {
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'ean debe contener exactamente 13 dígitos.',
  })
  ean!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'itemTypeCode no puede superar los 50 caracteres.',
  })
  itemTypeCode?: string;

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
  name!: string;

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

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value as Record<string, unknown>;
    }

    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return value;
    }
  })
  @IsObject({
    message: 'metadata debe ser un objeto JSON.',
  })
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'description no puede contener solo espacios.',
  })
  @MaxLength(1000, {
    message: 'description no puede superar los 1000 caracteres.',
  })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value as ItemDimensionsDto;
    }

    try {
      return JSON.parse(value) as ItemDimensionsDto;
    } catch {
      return value;
    }
  })
  @ValidateNested()
  @Type(() => ItemDimensionsDto)
  dimensions?: ItemDimensionsDto;
}
