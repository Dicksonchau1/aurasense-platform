import { BaseBodySchemaAdapter } from './base';
import { AdapterConfig } from '../types/adapter';

export class FigureBodySchemaAdapter extends BaseBodySchemaAdapter {
  constructor(config: AdapterConfig) {
    super(config);
  }
  async bootstrap() { throw new Error('Not implemented'); }
  ingestTelemetry() { throw new Error('Not implemented'); }
  getSchemaState() { throw new Error('Not implemented'); }
  async exportSchema() { throw new Error('Not implemented'); }
  async importSchema() { throw new Error('Not implemented'); }
  async checkpoint() { throw new Error('Not implemented'); }
  async shutdown() { throw new Error('Not implemented'); }
}
