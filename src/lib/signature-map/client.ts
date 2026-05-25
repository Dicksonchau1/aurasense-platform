export type SignatureMapClient = {
  lookup: (key: string) => Promise<any | null>;
  upsert: (key: string, value: any) => Promise<void>;
};
export function getSignatureMapClient(): SignatureMapClient {
  return {
    async lookup(_key) { return null; },
    async upsert(_key, _value) {},
  };
}
export default { getSignatureMapClient };