import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchItemsQueryDto } from './search-items-query.dto';

describe('SearchItemsQueryDto', () => {
  it('trims query and applies pagination defaults', async () => {
    const dto = plainToInstance(SearchItemsQueryDto, { query: ' leche ' });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto).toMatchObject({ query: 'leche', page: 1, limit: 20 });
  });

  it('rejects a one-character query', async () => {
    const dto = plainToInstance(SearchItemsQueryDto, { query: 'a' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });

  it('rejects page zero', async () => {
    const dto = plainToInstance(SearchItemsQueryDto, {
      query: 'leche',
      page: 0,
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });

  it('rejects limits greater than 50', async () => {
    const dto = plainToInstance(SearchItemsQueryDto, {
      query: 'leche',
      limit: 51,
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
