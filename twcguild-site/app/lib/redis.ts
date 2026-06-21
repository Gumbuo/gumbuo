import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });
const connected = client.connect();

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    await connected;
    const val = await client.get(key);
    if (!val) return null;
    try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
  },
  async set(key: string, value: unknown): Promise<void> {
    await connected;
    await client.set(key, JSON.stringify(value));
  },
};
