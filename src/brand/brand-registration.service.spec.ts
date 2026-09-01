import { BrandService } from './brand.service';
import type { IBrandRepository } from './repository/brand.repository.interface';

describe('BrandService registration support', () => {
  const searchByNormalizedName = jest.fn();
  const findByNormalizedName = jest.fn();
  const findByName = jest.fn();
  const create = jest.fn();
  const repository = {
    searchByNormalizedName,
    findByNormalizedName,
    findByName,
    create,
  } as unknown as IBrandRepository;
  const service = new BrandService(repository);

  beforeEach(() => jest.resetAllMocks());

  it('normalizes deterministic brand searches', async () => {
    searchByNormalizedName.mockResolvedValue([
      { id: 1, name: 'Coca Cola', normalized_name: 'cocacola' },
    ]);
    await expect(service.search(' C\u00f3ca-Cola ')).resolves.toEqual([
      { id: 1, name: 'Coca Cola' },
    ]);
    expect(searchByNormalizedName).toHaveBeenCalledWith('cocacola', 10);
  });

  it('does not search fewer than two useful characters', async () => {
    await expect(service.search('--')).resolves.toEqual([]);
    expect(searchByNormalizedName).not.toHaveBeenCalled();
  });

  it('returns an existing normalized brand without creating another', async () => {
    findByNormalizedName.mockResolvedValue({
      id: 2,
      name: 'Coca Cola',
      normalized_name: 'cocacola',
    });
    await expect(
      service.createOrResolve({ name: 'C\u00f3ca-Cola' }),
    ).resolves.toEqual({
      id: 2,
      name: 'Coca Cola',
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('resolves the winner after a concurrent create failure', async () => {
    findByNormalizedName.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 3,
      name: 'Nueva',
      normalized_name: 'nueva',
    });
    findByName.mockResolvedValue(null);
    create.mockRejectedValue(new Error('unique'));
    await expect(service.createOrResolve({ name: 'Nueva' })).resolves.toEqual({
      id: 3,
      name: 'Nueva',
    });
  });
});
