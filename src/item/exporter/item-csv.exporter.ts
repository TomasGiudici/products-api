import { ItemResponseDto } from '../dto/item-response.dto';

export class ItemCsvExporter {
  static export(items: ItemResponseDto[]): string {
    const headers = [
      'id',
      'ean',
      'itemType',
      'name',
      'description',
      'brand',
      'category',
      'quantity',
      'unitAbbreviation',
      'imagePath',
      'dimensions',
      'metadata',
    ];

    const rows = items.map((item) => [
      item.id,
      item.ean,
      item.itemType,
      item.name,
      item.description,
      item.brand,
      item.category,
      item.quantity,
      item.unitAbbreviation,
      item.imagePath,
      item.dimensions,
      item.metadata,
    ]);

    return [
      headers.join(','),
      ...rows.map((row) =>
        row.map((value) => this.escapeCsvValue(value)).join(','),
      ),
    ].join('\r\n');
  }

  private static escapeCsvValue(value: unknown): string {
    const stringValue = this.toCsvString(value);

    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n') ||
      stringValue.includes('\r')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  private static toCsvString(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value) ?? '';
      } catch {
        return '';
      }
    }

    return '';
  }
}
