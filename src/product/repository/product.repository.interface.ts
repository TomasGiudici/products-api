import type {
  CreateProductPersistenceData,
  UpdateProductPersistenceData,
} from '../interface/create-product-data.interface';
import type { ProductDetail } from '../interface/product-detail.interface';

export interface IProductRepository {
  findByEan(ean: string): Promise<ProductDetail | null>;

  create(data: CreateProductPersistenceData): Promise<ProductDetail>;

  updateByEan(
    ean: string,
    data: UpdateProductPersistenceData,
  ): Promise<ProductDetail>;
}
