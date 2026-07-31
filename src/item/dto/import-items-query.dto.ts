import { IsEnum, IsOptional } from 'class-validator';

export enum ImportItemsMode {
  CREATE_ONLY = 'createOnly',
  UPSERT = 'upsert',
}

export class ImportItemsQueryDto {
  @IsOptional()
  @IsEnum(ImportItemsMode, {
    message: 'mode debe ser createOnly o upsert.',
  })
  mode?: ImportItemsMode;
}
