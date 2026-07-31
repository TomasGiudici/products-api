import { ItemResponseDto } from './item-response.dto';

export class PaginatedItemsMetaDto {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
  hasNextPage!: boolean;
  hasPreviousPage!: boolean;
}

export class PaginatedItemsResponseDto {
  data!: ItemResponseDto[];
  meta!: PaginatedItemsMetaDto;
}
