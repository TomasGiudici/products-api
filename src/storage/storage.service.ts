import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly productImagesBucket: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');

    const supabaseServiceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.productImagesBucket = this.configService.getOrThrow<string>(
      'SUPABASE_PRODUCT_IMAGES_BUCKET',
    );

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async uploadItemImage(
    ean: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const processedImage = await this.processImage(file);
    const imagePath = `items/${ean}.jpg`;

    const { error } = await this.supabase.storage
      .from(this.productImagesBucket)
      .upload(imagePath, processedImage, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo subir la imagen del ítem.',
      );
    }

    return imagePath;
  }

  async uploadUpdatedItemImage(
    ean: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const processedImage = await this.processImage(file);
    const timestamp = Date.now();

    const imagePath = `items/${ean}-${timestamp}.jpg`;

    const { error } = await this.supabase.storage
      .from(this.productImagesBucket)
      .upload(imagePath, processedImage, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo subir la imagen del ítem.',
      );
    }

    return imagePath;
  }

  async deleteItemImage(imagePath: string): Promise<void> {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const { error } = await this.supabase.storage
        .from(this.productImagesBucket)
        .remove([imagePath]);

      if (!error) return;

      const log = {
        event: 'item-image-delete-failed',
        imagePath,
        attempt,
        error: error.message,
      };
      if (attempt < 3) this.logger.warn(log);
      else this.logger.error(log);
    }
  }

  private async processImage(file: Express.Multer.File): Promise<Buffer> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('La imagen debe ser JPG, PNG o WEBP.');
    }

    const maxSizeInBytes = 2 * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      throw new BadRequestException('La imagen no puede superar los 2 MB.');
    }

    const detectedMimeType = this.detectImageMimeType(file.buffer);
    if (!detectedMimeType || detectedMimeType !== file.mimetype) {
      throw new BadRequestException(
        'El contenido de la imagen no coincide con su formato.',
      );
    }

    try {
      const input = sharp(file.buffer, {
        failOn: 'warning',
        limitInputPixels: 16_000_000,
      });
      const metadata = await input.metadata();
      if (!metadata.width || !metadata.height) {
        throw new BadRequestException(
          'La imagen no posee dimensiones válidas.',
        );
      }

      for (const quality of [82, 72, 62]) {
        const output = await sharp(file.buffer, {
          failOn: 'warning',
          limitInputPixels: 16_000_000,
        })
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();

        if (output.length <= maxSizeInBytes) return output;
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;
      this.logger.warn({
        event: 'item-image-processing-rejected',
        error: error instanceof Error ? error.message : 'unknown',
      });
      throw new BadRequestException('La imagen está dañada o no es válida.');
    }

    throw new BadRequestException(
      'No se pudo reducir la imagen por debajo de 2 MB.',
    );
  }

  private detectImageMimeType(buffer: Buffer): string | null {
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return 'image/jpeg';
    }

    const pngSignature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature)) {
      return 'image/png';
    }

    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return 'image/webp';
    }

    return null;
  }

  getPublicItemImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) {
      return null;
    }

    const { data } = this.supabase.storage
      .from(this.productImagesBucket)
      .getPublicUrl(imagePath);

    return data.publicUrl;
  }
}
