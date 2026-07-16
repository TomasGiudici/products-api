import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class FilterItemsDto {
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
  @IsString()
  @Matches(/\S/, {
    message: 'search no puede contener solo espacios.',
  })
  @MaxLength(255, {
    message: 'search no puede superar los 255 caracteres.',
  })
  search?: string;
}
