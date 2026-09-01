import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchBrandsQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  query!: string;
}
