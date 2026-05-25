import { SubstrateClient } from "./SubstrateClient";

describe("SubstrateClient", () => {
  it("should connect and disconnect", async () => {
    const client = new SubstrateClient({});
    await client.connect();
    expect((await client.status()).status).toBe("connected");
    await client.disconnect();
    expect((await client.status()).status).toBe("disconnected");
  });
});
