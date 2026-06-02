import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

/**
 * A simple wrapper around native fetch API for handling requests, headers, and errors.
 */
export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  try {
    const { params, headers, ...customConfig } = options;
    
    // Build query string if params are provided
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    // Default headers
    const authHeaders: Record<string, string> = {};
    if (!(customConfig.body instanceof FormData)) {
      authHeaders['Content-Type'] = 'application/json';
    }
    
    // Check for auth token in localStorage (Browser environment only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const config: RequestInit = {
      ...customConfig,
      signal: customConfig.signal || controller.signal,
      headers: {
        ...authHeaders,
        ...headers,
      },
    };

    const response = await fetch(url, config);
    clearTimeout(timeout);
    
    // Avoid parsing JSON if the response is 204 No Content
    if (response.status === 204) {
       return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Something went wrong',
      };
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      message: data.message,
    };
  } catch (error: any) {
    console.error('API Client Error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred. Please check your connection.',
    };
  }
}
