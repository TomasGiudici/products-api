import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IdentifierTypeController } from './identifier-type.controller';
import { IdentifierTypeService } from './identifier-type.service';
import { IdentifierTypePrismaRepository } from './repository/identifier-type-prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [IdentifierTypeController],
  providers: [
    IdentifierTypeService,
    {
      provide: 'identifierTypeRepository',
      useClass: IdentifierTypePrismaRepository,
    },
  ],
  exports: [IdentifierTypeService],
})
export class IdentifierTypeModule {}
