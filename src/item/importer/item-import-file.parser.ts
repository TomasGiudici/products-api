import { BadRequestException } from '@nestjs/common';
import { parse as parseCsv } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import type { RawImportItemRow } from '../interface/import-item-data.interface';

export class ItemImportFileParser {
  static parse(file: Express.Multer.File): RawImportItemRow[] {
    const extension = this.getFileExtension(file.originalname);

    if (extension === 'csv') {
      return this.parseCsv(file.buffer);
    }

    if (extension === 'xlsx') {
      return this.parseXlsx(file.buffer);
    }

    throw new BadRequestException('El archivo debe ser CSV o XLSX.');
  }

  private static parseCsv(buffer: Buffer): RawImportItemRow[] {
    try {
      const parsedRecords = parseCsv(buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }) as unknown;

      return this.toRawImportRows(parsedRecords);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('No se pudo leer el archivo CSV.');
    }
  }

  private static parseXlsx(buffer: Buffer): RawImportItemRow[] {
    try {
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
      });

      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new BadRequestException('El archivo XLSX no contiene hojas.');
      }

      const worksheet = workbook.Sheets[firstSheetName];

      if (!worksheet) {
        throw new BadRequestException('No se pudo leer la primera hoja XLSX.');
      }

      const parsedRecords = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false,
      }) as unknown;

      return this.toRawImportRows(parsedRecords);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('No se pudo leer el archivo XLSX.');
    }
  }

  private static toRawImportRows(records: unknown): RawImportItemRow[] {
    if (!Array.isArray(records)) {
      throw new BadRequestException('El archivo no tiene un formato válido.');
    }

    if (records.length === 0) {
      throw new BadRequestException('El archivo no contiene filas.');
    }

    return records.map((record, index): RawImportItemRow => {
      if (!this.isRecord(record)) {
        throw new BadRequestException(
          `La fila ${index + 2} no tiene un formato válido.`,
        );
      }

      return {
        ...record,
        __rowNumber: index + 2,
      };
    });
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() ?? '';
  }
}
