import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyGuard } from '../common/utils/guards/api-key.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class AuthModule {}
