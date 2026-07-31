export class ImportItemsErrorDto {
  row!: number;
  ean!: string | null;
  message!: string;
}

export class ImportItemsResponseDto {
  mode!: string;
  totalRows!: number;
  processed!: number;
  created!: number;
  updated!: number;
  failed!: number;
  errors!: ImportItemsErrorDto[];
}
