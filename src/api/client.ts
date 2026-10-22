import type { MbtaErrorItem, MbtaErrorResponse } from '../types/mbta';

export const MBTA_BASE_URL = 'https://api-v3.mbta.com';

export interface MbtaRequestOptions {
  params?: Record<
    string,
    | string
    | number
    | boolean
    | (string | number)[]
    | null
    | undefined
  >;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export class MbtaApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly errors: MbtaErrorItem[];
  readonly isRateLimit: boolean;
  readonly isUnauthorized: boolean;
  readonly isForbidden: boolean;
  readonly isServerError: boolean;
  readonly isBadRequest: boolean;

  constructor(
    message: string,
    status: number,
    statusText: string,
    errors: MbtaErrorItem[] = [],
  ) {
    super(message);
    this.name = 'MbtaApiError';
    this.status = status;
    this.statusText = statusText;
    this.errors = errors;
    this.isRateLimit = status === 429;
    this.isUnauthorized = status === 401;
    this.isForbidden = status === 403;
    this.isBadRequest = status === 400;
    this.isServerError = status >= 500 && status < 600;
  }
}

/**
 * Builds a query string adhering to MBTA v3 JSON:API parameter conventions:
 * - Arrays are serialized as comma-separated values (e.g. filter[route]=Red,Blue)
 * - Undefined and null values are omitted
 */
export function buildQueryString(
  params?: MbtaRequestOptions['params'],
): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.append(key, value.join(','));
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Reusable typed fetch client for the MBTA V3 API.
 * 
 * - Accepts endpoint paths and query params
 * - Automatically injects VITE_MBTA_API_KEY via x-api-key header when configured
 * - Supports AbortSignal for query cancellation
 * - Provides typed error handling for 400, 401, 403, 429, and 5xx responses
 */
export async function mbtaFetch<T>(
  endpoint: string,
  options: MbtaRequestOptions = {},
): Promise<T> {
  const { params, signal, headers: customHeaders } = options;
  const queryString = buildQueryString(params);
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${MBTA_BASE_URL}${normalizedEndpoint}${queryString}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.api+json',
    ...customHeaders,
  };

  // Add API key only when configured in environment, adhering to MBTA Swagger spec
  const apiKey = import.meta.env.VITE_MBTA_API_KEY?.trim();
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : 'Unknown network failure';
    throw new MbtaApiError(
      `Network error communicating with MBTA API: ${message}`,
      0,
      'NetworkError',
    );
  }

  if (!response.ok) {
    let errorItems: MbtaErrorItem[] = [];
    let errorDetail = '';

    try {
      const errorJson = (await response.json()) as MbtaErrorResponse;
      if (errorJson && Array.isArray(errorJson.errors)) {
        errorItems = errorJson.errors;
        errorDetail = errorItems.map((e) => e.detail || e.title || e.code).filter(Boolean).join('; ');
      }
    } catch {
      // Body may not be valid JSON
    }

    let message: string;
    switch (response.status) {
      case 400:
        message = errorDetail
          ? `MBTA API Bad Request (400): ${errorDetail}`
          : 'MBTA API Bad Request (400): Invalid request parameters.';
        break;
      case 401:
        message =
          'MBTA API authentication failed (401). Please check your VITE_MBTA_API_KEY configuration.';
        break;
      case 403:
        message =
          'MBTA API access forbidden (403). The requested operation or endpoint is restricted.';
        break;
      case 429:
        message =
          'MBTA API rate limit exceeded (429). Please wait before retrying or configure an API key to increase your quota.';
        break;
      default:
        if (response.status >= 500) {
          message = `MBTA API server error (${response.status} ${response.statusText}). The MBTA service is temporarily unavailable.`;
        } else {
          message = errorDetail
            ? `MBTA API error (${response.status}): ${errorDetail}`
            : `MBTA API request failed with status ${response.status} (${response.statusText}).`;
        }
    }

    throw new MbtaApiError(message, response.status, response.statusText, errorItems);
  }

  return (await response.json()) as T;
}
