import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateItemDto } from './create-item.dto';

describe('CreateItemDto', () => {
  it('accepts only EAN-13 values with a valid check digit', async () => {
    const dto = new CreateItemDto();
    dto.name = 'Producto';
    dto.ean = '7791234567890';
    expect(await validate(dto)).not.toHaveLength(0);

    dto.ean = '7791234567898';
    expect(await validate(dto)).toHaveLength(0);
  });
});
