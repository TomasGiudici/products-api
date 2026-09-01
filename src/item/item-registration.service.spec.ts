import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ItemService } from './item.service';
import type { IItemRepository } from './repository/item.repository.interface';

describe('ItemService interactive registration', () => {
  const findByEan = jest.fn();
  const create = jest.fn();
  const repository = {
    findByEan,
    create,
  } as unknown as IItemRepository;
  const itemTypeService = { findByCode: jest.fn(), findById: jest.fn() };
  const brandService = {
    findById: jest.fn(),
    resolveOrCreateByName: jest.fn(),
  };
  const categoryService = { findByName: jest.fn(), findById: jest.fn() };
  const unitService = { findByAbbreviation: jest.fn(), findById: jest.fn() };
  const storageService = {
    uploadItemImage: jest.fn(),
    deleteItemImage: jest.fn(),
    getPublicItemImageUrl: jest.fn().mockReturnValue(null),
  };
  const service = new ItemService(
    repository,
    itemTypeService as never,
    brandService as never,
    categoryService as never,
    unitService as never,
    storageService as never,
  );
  const createdItem = {
    id: 'item-id',
    ean: '7791234567890',
    itemTypeId: null,
    name: 'Producto',
    description: null,
    brandId: 7,
    categoryId: null,
    quantity: null,
    unitId: null,
    unitsPerPack: null,
    imagePath: null,
    dimensions: null,
    metadata: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    findByEan.mockReset().mockResolvedValue(null);
    create.mockReset().mockResolvedValue(createdItem);
    brandService.findById.mockResolvedValue({ id: 7, name: 'Elegida' });
  });

  it('uses an explicitly selected brandId', async () => {
    await service.createItem({
      ean: createdItem.ean,
      name: createdItem.name,
      brandId: 7,
    });
    expect(brandService.resolveOrCreateByName).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ brand_id: 7 }),
    );
  });

  it('rejects a brandId that does not exist', async () => {
    brandService.findById.mockRejectedValue(new NotFoundException());
    await expect(
      service.createItem({
        ean: createdItem.ean,
        name: createdItem.name,
        brandId: 99,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('keeps brandName compatibility', async () => {
    brandService.resolveOrCreateByName.mockResolvedValue({
      id: 7,
      name: 'Importada',
    });
    await service.createItem({
      ean: createdItem.ean,
      name: createdItem.name,
      brandName: 'Importada',
    });
    expect(brandService.resolveOrCreateByName).toHaveBeenCalledWith(
      'Importada',
    );
  });

  it('uploads an optional image without changing existing storage ownership', async () => {
    storageService.uploadItemImage.mockResolvedValue('items/product.jpg');
    create.mockResolvedValue({
      ...createdItem,
      imagePath: 'items/product.jpg',
    });
    const image = {
      buffer: Buffer.from('image'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File;
    await service.createItem(
      { ean: createdItem.ean, name: createdItem.name, brandId: 7 },
      image,
    );
    expect(storageService.uploadItemImage).toHaveBeenCalledWith(
      createdItem.ean,
      image,
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ image_path: 'items/product.jpg' }),
    );
  });
});
