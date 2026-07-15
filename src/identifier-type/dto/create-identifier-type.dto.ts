import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateIdentifierTypeDto {
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
}
