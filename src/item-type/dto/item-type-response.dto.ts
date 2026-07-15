export class ItemTypeResponseDto {
  id!: number;
  code!: string;
  name!: string;
  description!: string | null;
  metadataSchema!: Record<string, unknown> | null;
  active!: boolean;
}
