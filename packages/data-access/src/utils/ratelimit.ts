/**
 * In-memory rate limiting for Server Actions
 * 
 * For production, consider using Upstash Redis:
 * - Install: npm install @upstash/ratelimit @upstash/redis
 * - Set up: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 * - Replace this file with Upstash implementation
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetAt) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  async limit(key: string, maxRequests: number, windowMs: number): Promise<{ success: boolean }> {
    const now = Date.now();
    const record = this.store.get(key);

    // No record or expired - create new
    if (!record || now > record.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true };
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return { success: false };
    }

    // Increment count
    record.count++;
    return { success: true };
  }

  cleanup() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

const rateLimiter = new InMemoryRateLimiter();

// Rate limiter configurations
export const signupRateLimit = {
  limit: async (key: string) => rateLimiter.limit(key, 5, 60 * 60 * 1000), // 5 per hour
};

export const votingRateLimit = {
  limit: async (key: string) => rateLimiter.limit(key, 10, 60 * 60 * 1000), // 10 per hour
};

export const submissionRateLimit = {
  limit: async (key: string) => rateLimiter.limit(key, 5, 60 * 60 * 1000), // 5 per hour
};

export const emailRateLimit = {
  limit: async (key: string) => rateLimiter.limit(key, 3, 60 * 60 * 1000), // 3 per hour
};

// Export for testing/cleanup
export const _rateLimiter = rateLimiter;
