export interface ItemDetail {
  id: string;

  identifierTypeId: number;
  identifierValue: string;
  normalizedIdentifierValue: string;

  itemTypeId: number | null;

  name: string;

  brandId: number | null;
  categoryId: number | null;

  quantity: number | null;
  unitId: number | null;
  unitsPerPack: number | null;

  imagePath: string | null;

  metadata: Record<string, unknown> | null;
}
