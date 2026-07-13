import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateProductPersistenceData } from '../interface/create-product-data.interface';
import type { ProductDetail } from '../interface/product-detail.interface';
import type { IProductRepository } from './product.repository.interface';

@Injectable()
export class ProductPrismaRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEan(ean: string): Promise<ProductDetail | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        ean,
      },
      include: {
        brand: true,
        category: true,
        unit_of_measure: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.toProductDetail(product);
  }

  async create(data: CreateProductPersistenceData): Promise<ProductDetail> {
    const product = await this.prisma.product.create({
      data: {
        ean: data.ean,
        name: data.name,
        brand_id: data.brand_id,
        category_id: data.category_id,
        quantity: data.quantity,
        unit_id: data.unit_id,
        units_per_pack: data.units_per_pack,
        image_path: data.image_path,
      },
      include: {
        brand: true,
        category: true,
        unit_of_measure: true,
      },
    });

    return this.toProductDetail(product);
  }

  private toProductDetail(product: {
    ean: string;
    name: string;
    quantity: { toNumber(): number } | null;
    units_per_pack: number | null;
    image_path: string | null;
    brand: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
    unit_of_measure: {
      id: number;
      name: string;
      abbreviation: string;
    } | null;
  }): ProductDetail {
    return {
      ean: product.ean,
      name: product.name,

      brand: {
        id: product.brand.id,
        name: product.brand.name,
      },

      category: {
        id: product.category.id,
        name: product.category.name,
      },

      quantity: product.quantity?.toNumber() ?? null,
      unitsPerPack: product.units_per_pack,

      unit: product.unit_of_measure
        ? {
            id: product.unit_of_measure.id,
            name: product.unit_of_measure.name,
            abbreviation: product.unit_of_measure.abbreviation,
          }
        : null,

      imagePath: product.image_path,
    };
  }
}
