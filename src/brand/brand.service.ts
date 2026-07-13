import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { normalizeText } from '../common/utils/normalize-text.util';
import { BrandReferenceDto } from './dto/brand-reference.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandMapper } from './mapper/brand.mapper';
import type { IBrandRepository } from './repository/brand.repository.interface';

@Injectable()
export class BrandService {
  constructor(
    @Inject('brandRepository')
    private readonly brandRepository: IBrandRepository,
  ) {}

  async createBrand(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    const persistenceData = BrandMapper.toPersistence(createBrandDto);

    const existingBrand = await this.brandRepository.findByNormalizedName(
      persistenceData.normalized_name,
    );

    if (existingBrand) {
      throw new ConflictException('Esta marca ya existe.');
    }

    const createdBrand = await this.brandRepository.create(persistenceData);

    return BrandMapper.toResponse(createdBrand);
  }

  async findAll(): Promise<BrandResponseDto[]> {
    const brands = await this.brandRepository.findAll();

    return BrandMapper.toResponseList(brands);
  }

  async findById(id: number): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException('Marca no encontrada.');
    }

    return BrandMapper.toResponse(brand);
  }

  async resolveOrCreateByName(name: string): Promise<BrandReferenceDto> {
    const trimmedName = name.trim();
    const normalizedName = normalizeText(trimmedName);

    const existingBrand =
      await this.brandRepository.findByNormalizedName(normalizedName);

    if (existingBrand) {
      return BrandMapper.toReference(existingBrand);
    }

    const createdBrand = await this.brandRepository.create({
      name: trimmedName,
      normalized_name: normalizedName,
    });

    return BrandMapper.toReference(createdBrand);
  }
}
