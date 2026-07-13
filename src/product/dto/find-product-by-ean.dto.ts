import { IsString, Matches } from 'class-validator';

export class FindProductByEanDto {
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'ean debe contener exactamente 13 dígitos.',
  })
  ean!: string;
}
