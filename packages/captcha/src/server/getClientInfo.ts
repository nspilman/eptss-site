/**
 * Server-side utilities for extracting client information from requests
 */

import type { ClientInfo } from '../types';

/**
 * Extract client IP address and user agent from request headers
 * Works with Next.js request objects and standard Headers
 *
 * @param headers - Request headers (from NextRequest or ReadonlyHeaders)
 * @returns ClientInfo with IP address and user agent
 */
export function getClientInfo(headers: Headers | ReadonlyHeaders): ClientInfo {
  // Try to get IP from common headers (Vercel, Cloudflare, nginx, etc.)
  const ipAddress =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-vercel-forwarded-for') || // Vercel
    undefined;

  const userAgent = headers.get('user-agent') || undefined;

  return {
    ipAddress,
    userAgent,
  };
}

/**
 * TypeScript helper to work with ReadonlyHeaders from next/headers
 */
type ReadonlyHeaders = {
  get(name: string): string | null;
  has(name: string): boolean;
  forEach(callbackfn: (value: string, key: string) => void): void;
};
