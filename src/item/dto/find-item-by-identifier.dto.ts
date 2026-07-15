import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FindItemByIdentifierDto {
  @IsString()
  @IsNotEmpty({
    message: 'identifierTypeCode no puede estar vacío.',
  })
  @MaxLength(50, {
    message: 'identifierTypeCode no puede superar los 50 caracteres.',
  })
  identifierTypeCode!: string;

  @IsString()
  @IsNotEmpty({
    message: 'identifierValue no puede estar vacío.',
  })
  @MaxLength(100, {
    message: 'identifierValue no puede superar los 100 caracteres.',
  })
  identifierValue!: string;
}
