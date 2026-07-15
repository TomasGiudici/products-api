import { Injectable } from '@nestjs/common';
import type { identifier_type as IdentifierType } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateIdentifierTypePersistenceData,
  IIdentifierTypeRepository,
} from './identifier-type.repository.interface';

@Injectable()
export class IdentifierTypePrismaRepository implements IIdentifierTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateIdentifierTypePersistenceData,
  ): Promise<IdentifierType> {
    return this.prisma.identifier_type.create({
      data,
    });
  }

  async findAll(): Promise<IdentifierType[]> {
    return this.prisma.identifier_type.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findById(id: number): Promise<IdentifierType | null> {
    return this.prisma.identifier_type.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code: string): Promise<IdentifierType | null> {
    return this.prisma.identifier_type.findUnique({
      where: {
        code,
      },
    });
  }
}
