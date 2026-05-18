// Common types for API responses

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | string[];
};

// Generic type for paginated responses if needed in the future
export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
}>;
