import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const receivedApiKey = request.header('x-api-key');

    const expectedApiKey = this.configService.get<string>('API_KEY');

    if (!expectedApiKey) {
      throw new UnauthorizedException('API Key no configurada.');
    }

    if (!receivedApiKey) {
      throw new UnauthorizedException('API Key requerida.');
    }

    const isValid = this.compareApiKeys(receivedApiKey, expectedApiKey);

    if (!isValid) {
      throw new UnauthorizedException('API Key inválida.');
    }

    return true;
  }

  private compareApiKeys(
    receivedApiKey: string,
    expectedApiKey: string,
  ): boolean {
    const receivedBuffer = Buffer.from(receivedApiKey);
    const expectedBuffer = Buffer.from(expectedApiKey);

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  }
}
