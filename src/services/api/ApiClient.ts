/**
 * services/api/ApiClient.ts
 *
 * Thin fetch-based HTTP client.
 * Swap `BASE_URL` and remove mock interceptor when backend is ready.
 *
 * Features:
 *  - Typed request/response
 *  - Auth token injection
 *  - Unified error handling
 *  - Request timeout
 *  - JSON parse safety
 */

import { StorageService } from '@services/storage/StorageService';
import { STORAGE_KEYS } from '@constants';
import { ApiError } from '@types/models';

const BASE_URL = 'https://api.maternellea.com/v1'; // replace with real URL
const TIMEOUT_MS = 15_000;

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method?:   HttpMethod;
  body?:     unknown;
  headers?:  Record<string, string>;
  timeout?:  number;
  skipAuth?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  ERROR CLASS
// ─────────────────────────────────────────────────────────────

export class ApiException extends Error {
  constructor(
    public readonly code:    string,
    public readonly status:  number,
    message:                 string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// ─────────────────────────────────────────────────────────────
//  CORE REQUEST
// ─────────────────────────────────────────────────────────────

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const {
    method   = 'GET',
    body,
    headers  = {},
    timeout  = TIMEOUT_MS,
    skipAuth = false,
  } = config;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeout);

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = StorageService.getString(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body:    body != null ? JSON.stringify(body) : undefined,
      signal:  controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response body safely
    const text = await response.text();
    let data: unknown;
    try {
      data = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const err = data as Partial<ApiError>;
      throw new ApiException(
        err.code    ?? 'UNKNOWN_ERROR',
        response.status,
        err.message ?? `HTTP ${response.status}`,
        err.details,
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiException) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new ApiException('TIMEOUT', 0, 'Request timed out');
    }
    throw new ApiException('NETWORK_ERROR', 0, 'Network request failed');
  }
}

// ─────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────

export const ApiClient = {
  get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'PUT', body });
  },

  patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'DELETE' });
  },
} as const;
