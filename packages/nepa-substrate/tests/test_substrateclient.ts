import { SubstrateClient } from '../src/SubstrateClient';

describe('SubstrateClient', () => {
  it('connects and disconnects', async () => {
    const client = new SubstrateClient({});
    await client.connect();
    expect(client.status().connected).toBe(true);
    await client.disconnect();
    expect(client.status().connected).toBe(false);
  });
});
