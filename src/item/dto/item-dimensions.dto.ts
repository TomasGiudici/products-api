import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ItemDimensionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'dimensions.width debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'dimensions.width no puede ser negativo.',
  })
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'dimensions.height debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'dimensions.height no puede ser negativo.',
  })
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'dimensions.depth debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'dimensions.depth no puede ser negativo.',
  })
  depth?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10, {
    message: 'dimensions.unit no puede superar los 10 caracteres.',
  })
  unit?: string;
}
