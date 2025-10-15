import { ApiError, ApiResponse } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, { retryAfter });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, statusCode: number = 502) {
    super(`${service} error: ${message}`, statusCode, 'EXTERNAL_SERVICE_ERROR', true, { service });
  }
}

export const createApiError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  details?: any
): ApiError => {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
};

export const createErrorResponse = (
  error: Error | AppError | ApiError,
  requestId?: string
): Response => {
  let statusCode = 500;
  let apiError: ApiError;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    apiError = createApiError(error.message, statusCode, error.code, error.details);
  } else if (error instanceof Error) {
    apiError = createApiError(error.message, statusCode, 'INTERNAL_ERROR');
  } else {
    apiError = error as ApiError;
    statusCode = 500; // Default for unknown error types
  }

  const errorResponse: ApiResponse = {
    success: false,
    error: apiError.message,
    timestamp: apiError.timestamp,
  };

  // Add request ID if available
  if (requestId) {
    errorResponse.error = `[${requestId}] ${errorResponse.error}`;
  }

  // Log error for debugging
  console.error('API Error:', JSON.stringify({
    ...apiError,
    requestId,
    stack: error instanceof Error ? error.stack : undefined,
  }));

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      // Add CORS headers if needed
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const handleAsyncError = (fn: Function) => {
  return (request: Request, env: any, ctx: any) => {
    return Promise.resolve(fn(request, env, ctx)).catch((error) => {
      return createErrorResponse(error);
    });
  };
};

// Common error handlers
export const handleValidationError = (message: string, details?: any): Response => {
  return createErrorResponse(new ValidationError(message, details));
};

export const handleAuthenticationError = (message?: string): Response => {
  return createErrorResponse(new AuthenticationError(message));
};

export const handleRateLimitError = (message?: string, retryAfter?: number): Response => {
  return createErrorResponse(new RateLimitError(message, retryAfter));
};

export const handleExternalServiceError = (service: string, message: string): Response => {
  return createErrorResponse(new ExternalServiceError(service, message));
};