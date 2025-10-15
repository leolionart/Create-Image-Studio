# Cloudflare Pages Functions Documentation

## Tổng quan

Dưới đây là tài liệu về các function đã được tạo cho Cloudflare Pages trong dự án Create-Image-Studio. Các function này cung cấp các tính năng quan trọng như error handling, logging, rate limiting, và health checks.

## Cấu trúc thư mục

```
functions/
├── types/
│   └── index.ts                    # Type definitions chung
├── utils/
│   ├── errorHandler.ts             # Error handling utilities
│   └── logger.ts                   # Logging utilities
├── middleware/
│   └── auth.ts                     # Authentication & rate limiting middleware
└── api/
    ├── config.ts                   # API configuration endpoint
    ├── health.ts                   # Health check endpoint
    └── gemini.ts                   # Gemini API integration (đã cập nhật)
```

## 1. Type Definitions (`functions/types/index.ts`)

### Mô tả
Chứa các TypeScript interfaces và types được sử dụng chung trong toàn bộ ứng dụng.

### Các types chính
- `Env`: Environment variables cho Cloudflare Pages
- `ApiResponse`: Response format chuẩn cho API
- `ApiError`: Error format chuẩn
- `RequestInfo`: Thông tin về request
- `LogEntry`: Log entry format
- `RateLimitInfo`: Rate limiting information
- `HealthCheckResult`: Health check response format
- `ConfigInfo`: Configuration information

### Sử dụng
```typescript
import { Env, ApiResponse, HealthCheckResult } from '../types';
```

## 2. Error Handler (`functions/utils/errorHandler.ts`)

### Mô tả
Cung cấp hệ thống xử lý lỗi thống nhất với các class lỗi tùy chỉnh và utilities để tạo error responses.

### Các class lỗi
- `AppError`: Base error class
- `ValidationError`: Lỗi validation (400)
- `AuthenticationError`: Lỗi xác thực (401)
- `RateLimitError`: Lỗi rate limit (429)
- `ExternalServiceError`: Lỗi từ external services (502)

### Các functions chính
- `createApiError()`: Tạo API error object
- `createErrorResponse()`: Tạo error response
- `handleAsyncError()`: Wrapper cho async functions
- `handleValidationError()`: Xử lý validation errors
- `handleAuthenticationError()`: Xử lý authentication errors
- `handleRateLimitError()`: Xử lý rate limit errors
- `handleExternalServiceError()`: Xử lý external service errors

### Sử dụng
```typescript
import { ValidationError, handleValidationError } from '../utils/errorHandler';

// Throw validation error
throw new ValidationError('Invalid input data');

// Handle validation error
return handleValidationError('Invalid input data');
```

## 3. Logger (`functions/utils/logger.ts`)

### Mô tả
Hệ thống logging với các level khác nhau, request/response logging, và performance tracking.

### Các features
- Multiple log levels: info, warn, error, debug
- Request/response logging
- Performance metrics
- API call tracking
- Error logging với context
- Unique request ID generation

### Các methods chính
- `info()`: Log info message
- `warn()`: Log warning message
- `error()`: Log error message
- `debug()`: Log debug message
- `logRequest()`: Log incoming request
- `logResponse()`: Log outgoing response
- `logApiCall()`: Log API call với duration
- `logError()`: Log error với stack trace
- `logPerformance()`: Log performance metrics

### Middleware
- `withLogger()`: Wrapper để tự động log requests/responses
- `createChildLogger()`: Tạo logger với additional context

### Sử dụng
```typescript
import { withLogger, Logger } from '../utils/logger';

export const onRequestGet = withLogger(async (request, env, ctx, logger) => {
  logger.info('Processing request');
  // ... your code
});
```

## 4. Authentication & Rate Limiting (`functions/middleware/auth.ts`)

### Mô tả
Middleware cho authentication, rate limiting, CORS, và security headers.

### Các features
- Rate limiting (30 requests/phút per IP)
- CORS handling
- Security headers
- API key validation (placeholder)

### Configuration
```typescript
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,     // 30 requests per minute per IP
  trustProxy: true,
};
```

### Các functions chính
- `getRateLimitInfo()`: Lấy rate limit information
- `setRateLimitHeaders()`: Set rate limit headers
- `rateLimitMiddleware()`: Rate limiting middleware
- `validateApiKey()`: API key validation
- `corsMiddleware()`: CORS handling
- `securityHeadersMiddleware()`: Security headers
- `authMiddleware()`: Combined middleware
- `withAuth()`: Wrapper để apply middleware

### Sử dụng
```typescript
import { withAuth } from '../middleware/auth';

export const onRequestPost = withAuth(async (request, env, ctx, logger) => {
  // Request đã qua authentication và rate limiting
});
```

## 5. Configuration API (`functions/api/config.ts`)

### Mô tả
Endpoint để quản lý và validate configuration của ứng dụng.

### Endpoints
- `GET /api/config`: Lấy thông tin cấu hình (không bao gồm API key)
- `POST /api/config`: Validate API key
- `OPTIONS /api/config`: CORS preflight

### Response format
```typescript
{
  success: boolean,
  data?: ConfigInfo,
  error?: string,
  message?: string,
  timestamp: string
}
```

### Sử dụng
```bash
# Lấy configuration
curl https://your-domain.com/api/config

# Validate API key
curl -X POST https://your-domain.com/api/config
```

## 6. Health Check API (`functions/api/health.ts`)

### Mô tả
Endpoint để kiểm tra sức khỏe của ứng dụng và các external services.

### Endpoints
- `GET /api/health`: Full health check với detailed information
- `HEAD /api/health`: Simple health check
- `OPTIONS /api/health`: CORS preflight

### Response format
```typescript
{
  success: boolean,
  data: {
    status: 'healthy' | 'unhealthy',
    timestamp: string,
    version?: string,
    services: {
      geminiApi: {
        status: 'available' | 'unavailable',
        responseTime?: number,
        error?: string
      }
    },
    uptime: number
  },
  message?: string,
  timestamp: string
}
```

### Sử dụng
```bash
# Full health check
curl https://your-domain.com/api/health

# Simple health check
curl -I https://your-domain.com/api/health
```

## 7. Gemini API Integration (`functions/api/gemini.ts`)

### Mô tả
Updated Gemini API endpoint với error handling, logging, và middleware integration.

### Features
- Image editing với Gemini 2.5 Flash
- Image generation với Imagen 4.0
- Comprehensive error handling
- Request/response logging
- Performance tracking
- Rate limiting và authentication

### Endpoints
- `POST /api/gemini`: Process image generation/editing requests
- `OPTIONS /api/gemini`: CORS preflight

### Request format
```typescript
// Image editing
{
  action: 'edit',
  prompt: string,
  images: Array<{ base64: string, mimeType: string }>
}

// Image generation
{
  action: 'generate',
  prompt: string
}
```

### Response format
```typescript
{
  success: boolean,
  data?: {
    text?: string,
    imageBase64?: string
  },
  error?: string,
  message?: string,
  timestamp: string
}
```

## Deployment Notes

### Environment Variables
- `GEMINI_API_KEY`: Gemini API key
- `VITE_GEMINI_API_KEY`: Alternative API key (for compatibility)

### Rate Limiting
- 30 requests per minute per IP
- Configurable trong `functions/middleware/auth.ts`

### Logging
- Tự động log tất cả requests và responses
- Performance metrics cho API calls
- Error logs với detailed context

### Error Handling
- Standardized error responses
- Proper HTTP status codes
- Detailed error messages cho debugging

## Best Practices

1. **Luôn sử dụng middleware** cho authentication và rate limiting
2. **Sử dụng logger** để track performance và errors
3. **Handle errors properly** với custom error classes
4. **Validate inputs** trước khi xử lý
5. **Log API calls** để monitor performance
6. **Sử dụng proper HTTP status codes** cho responses
7. **Implement proper CORS** cho cross-origin requests

## Troubleshooting

### Common Issues
1. **Rate limit exceeded**: Giảm số lượng requests hoặc tăng limit
2. **API key invalid**: Kiểm tra environment variables
3. **CORS errors**: Kiểm tra CORS configuration
4. **TypeScript errors**: Kiểm tra type definitions

### Debugging
1. Kiểm tra logs trong Cloudflare dashboard
2. Sử dụng `/api/health` endpoint để check service status
3. Sử dụng browser dev tools để inspect requests/responses
4. Kiểm tra network tab cho CORS issues

## Future Enhancements

1. **Advanced rate limiting**: Sử dụng KV storage cho distributed rate limiting
2. **API key authentication**: Implement proper API key system
3. **Request caching**: Cache responses cho common requests
4. **Analytics**: Advanced analytics và monitoring
5. **Webhook support**: Webhook notifications cho errors/events