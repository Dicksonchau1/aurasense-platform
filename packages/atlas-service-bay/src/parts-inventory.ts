// Parts inventory management
import { Part } from './types';

export class PartsInventory {
  private parts: Part[] = [];

  update(part: Part): void {
    // TODO: Update part inventory
  }

  getLowStock(): Part[] {
    // TODO: Return low-stock SKUs
    return [];
  }
}
