import { IsUUID } from 'class-validator';

export class FindItemByIdDto {
  @IsUUID('4', {
    message: 'id debe ser un UUID válido.',
  })
  id!: string;
}
