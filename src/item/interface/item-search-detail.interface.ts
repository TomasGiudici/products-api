import type { ItemDetail } from './item-detail.interface';

export interface ItemSearchDetail extends ItemDetail {
  brandName: string | null;
}
