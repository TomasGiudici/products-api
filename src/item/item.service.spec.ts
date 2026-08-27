import { BadRequestException } from '@nestjs/common';
import { ItemService } from './item.service';
import type { IItemRepository } from './repository/item.repository.interface';

describe('ItemService search', () => {
  const searchByNormalizedName = jest.fn();
  const searchByCandidateEans = jest.fn();
  const getPublicItemImageUrl = jest.fn().mockReturnValue(null);
  const repository = {
    searchByNormalizedName,
    searchByCandidateEans,
  } as unknown as IItemRepository;
  const unusedService = {} as never;
  const service = new ItemService(
    repository,
    unusedService,
    unusedService,
    unusedService,
    unusedService,
    { getPublicItemImageUrl } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes the query and calculates pagination', async () => {
    searchByNormalizedName.mockResolvedValue({ items: [], total: 25 });

    const result = await service.search({
      query: ' LeChÉ ',
      page: 2,
      limit: 10,
    });

    expect(searchByNormalizedName).toHaveBeenCalledWith('leche', {
      skip: 10,
      take: 10,
    });
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it('returns an empty first page with zero total pages', async () => {
    searchByNormalizedName.mockResolvedValue({ items: [], total: 0 });

    await expect(
      service.search({ query: 'leche', page: 1, limit: 20 }),
    ).resolves.toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('maps search results to the existing item summary response', async () => {
    searchByNormalizedName.mockResolvedValue({
      items: [
        {
          id: 'item-id',
          ean: '7791234567890',
          itemTypeId: 1,
          itemTypeName: 'Producto',
          name: 'Alfajor',
          description: 'Detalle que no debe exponerse',
          brandId: 1,
          brandName: 'Marca',
          categoryId: 1,
          categoryName: 'Golosinas',
          quantity: 40,
          unitId: 1,
          unitAbbreviation: 'g',
          unitsPerPack: 1,
          imagePath: 'items/alfajor.jpg',
          dimensions: null,
          metadata: { source: 'example' },
        },
      ],
      total: 1,
    });

    const result = await service.search({
      query: 'alfajor',
      page: 1,
      limit: 20,
    });

    expect(result.data).toEqual([
      {
        ean: '7791234567890',
        name: 'Alfajor',
        brand: 'Marca',
        imageUrl: null,
      },
    ]);
    expect(getPublicItemImageUrl).toHaveBeenCalledWith('items/alfajor.jpg');
  });

  it('rejects a query with fewer than two useful characters', async () => {
    const dto = { query: '--', page: 1, limit: 20 };

    await expect(service.search(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(searchByNormalizedName).not.toHaveBeenCalled();
  });

  it('searches normalized text only within unique candidate EANs', async () => {
    searchByCandidateEans.mockResolvedValue({ items: [], total: 21 });

    const result = await service.searchByCandidates({
      query: ' ALFAJOR ',
      eans: ['7791234567890', '7791234567890', '7791234567891'],
      page: 2,
      limit: 20,
    });

    expect(searchByCandidateEans).toHaveBeenCalledWith(
      'alfajor',
      ['7791234567890', '7791234567891'],
      { skip: 20, take: 20 },
    );
    expect(result.meta).toEqual({
      page: 2,
      limit: 20,
      total: 21,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it('returns an empty candidate result without querying the repository', async () => {
    await expect(
      service.searchByCandidates({
        query: 'alfajor',
        eans: [],
        page: 1,
        limit: 20,
      }),
    ).resolves.toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(searchByCandidateEans).not.toHaveBeenCalled();
  });
});
