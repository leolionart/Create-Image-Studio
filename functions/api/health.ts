import { Env, ApiResponse, HealthCheckResult } from '../types';
import { withLogger, Logger } from '../utils/logger';
import { withAuth } from '../middleware/auth';
import { getApiKey, validateApiKey } from './config';
import { handleExternalServiceError } from '../utils/errorHandler';

export const config = {
  regions: ['iad'] as const,
};

// Check Gemini API health
export const checkGeminiApiHealth = async (apiKey: string, logger: Logger): Promise<{
  status: 'available' | 'unavailable';
  responseTime?: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    logger.debug('Checking Gemini API health');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      logger.info('Gemini API health check passed', { responseTime });
      return {
        status: 'available',
        responseTime,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      
      logger.warn('Gemini API health check failed', {
        status: response.status,
        error: errorMessage,
        responseTime,
      });
      
      return {
        status: 'unavailable',
        responseTime,
        error: errorMessage,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = (error as Error).message;
    
    logger.error('Gemini API health check error', {
      error: errorMessage,
      responseTime,
    });
    
    return {
      status: 'unavailable',
      responseTime,
      error: errorMessage,
    };
  }
};

// Get application uptime (simplified for Cloudflare Pages)
export const getUptime = (): number => {
  // In a real implementation, you might store the start time in a persistent storage
  // For now, we'll return a placeholder value
  return Math.floor(Math.random() * 86400); // Random uptime in seconds
};

// Handle GET requests - return health status
export const onRequestGet = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
  logger.info('Health check endpoint accessed');
  
  try {
    const startTime = Date.now();
    const apiKey = getApiKey(env);
    
    // Check if API key is configured and valid
    let geminiApiHealth: {
      status: 'available' | 'unavailable';
      responseTime?: number;
      error?: string;
    } = {
      status: 'unavailable',
      error: 'API key not configured',
    };
    
    if (apiKey && validateApiKey(apiKey)) {
      geminiApiHealth = await checkGeminiApiHealth(apiKey, logger);
    } else if (apiKey) {
      geminiApiHealth = {
        status: 'unavailable',
        error: 'Invalid API key format',
      };
    }
    
    const overallStatus = geminiApiHealth.status === 'available' ? 'healthy' : 'unhealthy';
    const responseTime = Date.now() - startTime;
    
    const healthResult: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        geminiApi: geminiApiHealth,
      },
      uptime: getUptime(),
    };
    
    const response: ApiResponse<HealthCheckResult> = {
      success: overallStatus === 'healthy',
      data: healthResult,
      message: overallStatus === 'healthy' 
        ? 'All services are operating normally' 
        : 'Some services are experiencing issues',
      timestamp: new Date().toISOString(),
    };
    
    logger.info('Health check completed', {
      status: overallStatus,
      responseTime,
      geminiApiStatus: geminiApiHealth.status,
    });
    
    return new Response(JSON.stringify(response), {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    logger.error('Health check failed', { error: (error as Error).message });
    
    const healthResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        geminiApi: {
          status: 'unavailable',
          error: (error as Error).message,
        },
      },
      uptime: getUptime(),
    };
    
    const response: ApiResponse<HealthCheckResult> = {
      success: false,
      data: healthResult,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(response), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}));

// Handle HEAD requests - simple health check without detailed response
export const onRequestHead = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
  logger.debug('Health check HEAD request');
  
  try {
    const apiKey = getApiKey(env);
    
    // Quick check if API key is configured and valid
    if (!apiKey || !validateApiKey(apiKey)) {
      return new Response(null, { status: 503 });
    }
    
    // Quick API health check
    const geminiHealth = await checkGeminiApiHealth(apiKey, logger);
    const status = geminiHealth.status === 'available' ? 200 : 503;
    
    return new Response(null, { status });
  } catch (error) {
    logger.error('Health check HEAD request failed', { error: (error as Error).message });
    return new Response(null, { status: 503 });
  }
}));

// Handle OPTIONS requests for CORS
export const onRequestOptions = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
  logger.debug('Health check CORS preflight request');
  
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}));