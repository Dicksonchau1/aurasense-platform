// Bundle pricing utility
// Created during recovery on 2026-05-30.

export interface Bundle {
  id: string;
  name: string;
  basePrice: number;
  items: BundleItem[];
}

export interface BundleItem {
  id: string;
  price: number;
}

export function computeBundlePrice(bundle: Bundle): number {
  const itemsTotal = bundle.items.reduce((sum, item) => sum + item.price, 0);
  return bundle.basePrice + itemsTotal;
}
