export interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export function successResponse<T>(
  data: T,
  statusCode: number,
  path: string,
  message = "Request successful",
): SuccessResponse<T> {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    path,
  };
}

export function errorResponse(
  message: string | string[],
  error: string,
  statusCode: number,
  path: string,
): ErrorResponse {
  return {
    success: false,
    statusCode,
    message,
    error,
    timestamp: new Date().toISOString(),
    path,
  };
}
