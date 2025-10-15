import { Env, ApiResponse, ConfigInfo } from '../types';
import { withLogger, Logger } from '../utils/logger';
import { withAuth } from '../middleware/auth';
import { handleValidationError } from '../utils/errorHandler';

export const config = {
  regions: ['iad'] as const,
};

// Get API key from environment variables
export const getApiKey = (env: Env): string | undefined => {
  return env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
};

// Validate API key format
export const validateApiKey = (apiKey: string | undefined): boolean => {
  if (!apiKey) return false;
  
  // Gemini API keys typically start with 'AIza' and are around 39 characters long
  const geminiKeyPattern = /^AIza[A-Za-z0-9_-]{35}$/;
  return geminiKeyPattern.test(apiKey);
};

// Get application configuration
export const getConfig = (env: Env): ConfigInfo => {
  const apiKey = getApiKey(env);
  const isApiKeyValid = validateApiKey(apiKey);
  
  return {
    apiVersion: '1.0.0',
    features: {
      imageGeneration: isApiKeyValid,
      imageEditing: isApiKeyValid,
      rateLimiting: true,
      logging: true,
    },
    limits: {
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxPromptLength: 2000,
      requestsPerMinute: 30,
    },
  };
};

// Handle GET requests - return configuration info (excluding sensitive data)
export const onRequestGet = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
  logger.info('Config endpoint accessed');
  
  try {
    const config = getConfig(env);
    const apiKey = getApiKey(env);
    
    // Check if API key is configured
    if (!apiKey) {
      logger.warn('API key not configured');
      return handleValidationError('API key not configured');
    }
    
    // Validate API key format
    if (!validateApiKey(apiKey)) {
      logger.error('Invalid API key format');
      return handleValidationError('Invalid API key format');
    }
    
    const response: ApiResponse<ConfigInfo> = {
      success: true,
      data: config,
      message: 'Configuration retrieved successfully',
      timestamp: new Date().toISOString(),
    };
    
    logger.info('Configuration retrieved successfully', {
      features: config.features,
      limits: config.limits,
    });
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error retrieving configuration', { error: (error as Error).message });
    throw error;
  }
}));

// Handle POST requests - validate configuration
export const onRequestPost = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
  logger.info('Config validation endpoint accessed');
  
  try {
    const apiKey = getApiKey(env);
    
    if (!apiKey) {
      logger.warn('API key not configured');
      return handleValidationError('API key not configured');
    }
    
    if (!validateApiKey(apiKey)) {
      logger.error('Invalid API key format');
      return handleValidationError('Invalid API key format');
    }
    
    // Try to make a simple API call to verify the key works
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const isValidKey = testResponse.ok;
    
    const response: ApiResponse<{ keyValid: boolean }> = {
      success: true,
      data: { keyValid: isValidKey },
      message: isValidKey ? 'API key is valid' : 'API key validation failed',
      timestamp: new Date().toISOString(),
    };
    
    logger.info('API key validation completed', {
      isValidKey,
      status: testResponse.status,
    });
    
    return new Response(JSON.stringify(response), {
      status: isValidKey ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error validating configuration', { error: (error as Error).message });
    
    const response: ApiResponse<{ keyValid: boolean }> = {
      success: false,
      data: { keyValid: false },
      error: 'Failed to validate API key',
      timestamp: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}));

// Handle OPTIONS requests for CORS
export const onRequestOptions = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
  logger.debug('Config CORS preflight request');
  
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}));