import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateUnitOfMeasureDto {
  @IsString()
  @IsNotEmpty({
    message: 'name no puede estar vacío.',
  })
  @Matches(/\S/, {
    message: 'name no puede contener solo espacios.',
  })
  @MaxLength(50, {
    message: 'name no puede superar los 50 caracteres.',
  })
  name!: string;

  @IsString()
  @IsNotEmpty({
    message: 'abbreviation no puede estar vacía.',
  })
  @Matches(/\S/, {
    message: 'abbreviation no puede contener solo espacios.',
  })
  @MaxLength(10, {
    message: 'abbreviation no puede superar los 10 caracteres.',
  })
  abbreviation!: string;
}
