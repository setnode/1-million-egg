import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export async function withCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redis) return fetcher();

  const cached = await redis.get<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const freshData = await fetcher();
  await redis.set(key, freshData, { ex: ttlSeconds });
  
  return freshData;
}
