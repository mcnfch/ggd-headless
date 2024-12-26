import Redis from 'ioredis';

export const redis = new Redis({
  port: 6379,
  host: 'localhost',
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
  enableReadyCheck: true,
  maxLoadingRetryTime: 5000,
}); 