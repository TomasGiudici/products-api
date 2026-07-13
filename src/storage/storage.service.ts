import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly supabase;
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

  async uploadProductImage(
    ean: string,
    file: Express.Multer.File,
  ): Promise<string> {
    this.validateImage(file);

    const extension = this.getImageExtension(file.mimetype);
    const imagePath = `products/${ean}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.productImagesBucket)
      .upload(imagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo subir la imagen del producto.',
      );
    }

    return imagePath;
  }

  async deleteProductImage(imagePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.productImagesBucket)
      .remove([imagePath]);

    if (error) {
      return;
    }
  }

  private validateImage(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('La imagen debe ser JPG, PNG o WEBP.');
    }

    const maxSizeInBytes = 2 * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      throw new BadRequestException('La imagen no puede superar los 2 MB.');
    }
  }

  private getImageExtension(mimeType: string): string {
    if (mimeType === 'image/jpeg') {
      return 'jpg';
    }

    if (mimeType === 'image/png') {
      return 'png';
    }

    if (mimeType === 'image/webp') {
      return 'webp';
    }

    throw new BadRequestException('Formato de imagen no soportado.');
  }
}
