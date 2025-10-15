import { RateLimitInfo } from '../types';
import { handleRateLimitError, handleAuthenticationError } from '../utils/errorHandler';
import { Logger } from '../utils/logger';

// Simple in-memory rate limiter (for production, consider using KV storage)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute per IP
  trustProxy: true,
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export const getRateLimitInfo = (ip: string): RateLimitResult => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
  
  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  // Get or create rate limit entry for this IP
  let entry = rateLimitStore.get(ip);
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    };
    rateLimitStore.set(ip, entry);
  }
  
  // Increment request count
  entry.count++;
  
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.count);
  const success = entry.count <= RATE_LIMIT_CONFIG.maxRequests;
  const retryAfter = success ? undefined : Math.ceil((entry.resetTime - now) / 1000);
  
  return {
    success,
    limit: RATE_LIMIT_CONFIG.maxRequests,
    remaining,
    reset: entry.resetTime,
    retryAfter,
  };
};

export const setRateLimitHeaders = (response: Response, rateLimitInfo: RateLimitResult): Response => {
  response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString());
  
  if (rateLimitInfo.retryAfter) {
    response.headers.set('Retry-After', rateLimitInfo.retryAfter.toString());
  }
  
  return response;
};

export const rateLimitMiddleware = (request: Request, logger: Logger): Response | null => {
  // Get client IP
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for') || 
             'unknown';
  
  logger.debug('Rate limit check', { ip });
  
  // Check rate limit
  const rateLimitInfo = getRateLimitInfo(ip);
  
  if (!rateLimitInfo.success) {
    logger.warn('Rate limit exceeded', {
      ip,
      limit: rateLimitInfo.limit,
      reset: rateLimitInfo.reset,
      retryAfter: rateLimitInfo.retryAfter,
    });
    
    const errorResponse = handleRateLimitError(
      'Too many requests. Please try again later.',
      rateLimitInfo.retryAfter
    );
    
    return setRateLimitHeaders(errorResponse, rateLimitInfo);
  }
  
  logger.debug('Rate limit check passed', {
    ip,
    remaining: rateLimitInfo.remaining,
  });
  
  return null; // Continue with the request
};

// Simple API key validation (if needed in the future)
export const validateApiKey = (request: Request, env: any, logger: Logger): Response | null => {
  // For now, we don't require API key validation
  // This can be implemented later if needed
  
  logger.debug('API key validation skipped');
  return null;
};

// CORS middleware
export const corsMiddleware = (request: Request): Response | null => {
  const origin = request.headers.get('Origin');
  const method = request.method;
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    const response = new Response(null, { status: 200 });
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    return response;
  }
  
  return null;
};

// Security headers middleware
export const securityHeadersMiddleware = (response: Response): Response => {
  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set CORS headers for non-preflight requests
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  return response;
};

// Combined middleware function
export const authMiddleware = (request: Request, env: any, logger: Logger): Response | null => {
  // Check CORS preflight
  const corsResponse = corsMiddleware(request);
  if (corsResponse) return corsResponse;
  
  // Check rate limit
  const rateLimitResponse = rateLimitMiddleware(request, logger);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Validate API key (if implemented)
  const authResponse = validateApiKey(request, env, logger);
  if (authResponse) return authResponse;
  
  return null; // Continue with the request
};

// Wrapper function to apply middleware to handlers
export const withAuth = (handler: (request: Request, env: any, ctx: any, logger: Logger) => Promise<Response>) => {
  return async (request: Request, env: any, ctx: any, logger: Logger): Promise<Response> => {
    // Apply middleware
    const middlewareResponse = authMiddleware(request, env, logger);
    if (middlewareResponse) return middlewareResponse;
    
    // Execute the handler
    const response = await handler(request, env, ctx, logger);
    
    // Apply security headers to the response
    return securityHeadersMiddleware(response);
  };
};