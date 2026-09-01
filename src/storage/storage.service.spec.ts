import { BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';

type ProcessImage = (file: Express.Multer.File) => Promise<Buffer>;

describe('StorageService image processing', () => {
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        SUPABASE_PRODUCT_IMAGES_BUCKET: 'product-images',
      };
      return values[key];
    }),
  };
  const service = new StorageService(config as never);
  const processImage = Reflect.get(service, 'processImage') as ProcessImage;

  function toFile(buffer: Buffer, mimetype: string): Express.Multer.File {
    return {
      buffer,
      mimetype,
      size: buffer.length,
      originalname: 'product.png',
    } as Express.Multer.File;
  }

  it('re-encodes a valid image as JPEG', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );

    const result = await processImage.call(service, toFile(png, 'image/png'));

    expect(result.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });

  it('rejects a file whose declared MIME type does not match its bytes', async () => {
    const fake = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    await expect(
      processImage.call(service, toFile(fake, 'image/png')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
