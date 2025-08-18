// Define types for successful and error responses
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: any | undefined;
  message: string;
  status: number;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  status: number | string;
  code: unknown;
  details: unknown;
  data: unknown;
  validationErrors: unknown;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Define a type for the request options
export type RequestOptions = {
  headers?: Record<string, string | string[]>;
  cache?: RequestCache;
  tags?: string[];
};
