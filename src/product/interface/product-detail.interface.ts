export interface ProductDetail {
  ean: string;
  name: string;

  brand: {
    id: number;
    name: string;
  };

  category: {
    id: number;
    name: string;
  };

  quantity: number | null;
  unitsPerPack: number | null;

  unit: {
    id: number;
    name: string;
    abbreviation: string;
  } | null;

  imagePath: string | null;
}
