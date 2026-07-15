import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateItemTypeDto {
  @IsString()
  @IsNotEmpty({
    message: 'code no puede estar vacío.',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'code solo puede contener letras, números y guiones bajos.',
  })
  @MaxLength(50, {
    message: 'code no puede superar los 50 caracteres.',
  })
  code!: string;

  @IsString()
  @IsNotEmpty({
    message: 'name no puede estar vacío.',
  })
  @MaxLength(100, {
    message: 'name no puede superar los 100 caracteres.',
  })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown => {
    const rawValue: unknown = value;

    if (typeof rawValue !== 'string') {
      return rawValue;
    }

    try {
      return JSON.parse(rawValue) as unknown;
    } catch {
      return rawValue;
    }
  })
  @IsObject({
    message: 'metadataSchema debe ser un objeto JSON.',
  })
  metadataSchema?: Record<string, unknown>;
}
