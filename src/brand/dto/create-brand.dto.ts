import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty({
    message: 'name no puede estar vacío.',
  })
  @Matches(/\S/, {
    message: 'name no puede contener solo espacios.',
  })
  @MaxLength(100, {
    message: 'name no puede superar los 100 caracteres.',
  })
  name!: string;
}
