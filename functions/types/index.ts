// Type definitions cho Cloudflare Pages Functions

export interface Env {
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  // Các environment variables khác có thể thêm vào đây
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface RequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  requestId?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  services: {
    geminiApi: {
      status: 'available' | 'unavailable';
      responseTime?: number;
      error?: string;
    };
    // Các services khác có thể thêm vào đây
  };
  uptime: number;
}

export interface ConfigInfo {
  apiVersion: string;
  features: {
    imageGeneration: boolean;
    imageEditing: boolean;
    rateLimiting: boolean;
    logging: boolean;
  };
  limits: {
    maxImageSize: number;
    maxPromptLength: number;
    requestsPerMinute: number;
  };
}