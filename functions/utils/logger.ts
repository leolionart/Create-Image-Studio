import { LogEntry, RequestInfo } from '../types';

export class Logger {
  private static instance: Logger;
  private requestId: string;
  private startTime: number;

  private constructor() {
    this.requestId = this.generateRequestId();
    this.startTime = Date.now();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  public getRequestId(): string {
    return this.requestId;
  }

  public getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  private createLogEntry(level: LogEntry['level'], message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      requestId: this.requestId,
    };
  }

  private log(entry: LogEntry): void {
    const logMessage = JSON.stringify(entry);
    
    switch (entry.level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(this.createLogEntry('info', message, context));
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log(this.createLogEntry('warn', message, context));
  }

  public error(message: string, context?: Record<string, any>): void {
    this.log(this.createLogEntry('error', message, context));
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log(this.createLogEntry('debug', message, context));
  }

  public logRequest(request: Request): void {
    const url = new URL(request.url);
    const requestInfo: RequestInfo = {
      method: request.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('cf-connecting-ip') || 
          request.headers.get('x-forwarded-for') || 
          'unknown',
      timestamp: new Date().toISOString(),
    };

    this.info('Request received', {
      request: requestInfo,
    });
  }

  public logResponse(response: Response, additionalContext?: Record<string, any>): void {
    this.info('Response sent', {
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      },
      elapsedTime: this.getElapsedTime(),
      ...additionalContext,
    });
  }

  public logApiCall(apiName: string, endpoint: string, duration: number, success: boolean, error?: string): void {
    this.info('API call completed', {
      api: apiName,
      endpoint,
      duration,
      success,
      error,
    });
  }

  public logError(error: Error, context?: Record<string, any>): void {
    this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  public logPerformance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info('Performance metric', {
      operation,
      duration,
      ...context,
    });
  }

  public reset(): void {
    this.requestId = this.generateRequestId();
    this.startTime = Date.now();
  }
}

// Middleware function to initialize logger for each request
export const withLogger = (handler: (request: Request, env: any, ctx: any, logger: Logger) => Promise<Response>) => {
  return async (request: Request, env: any, ctx: any): Promise<Response> => {
    const logger = Logger.getInstance();
    logger.reset();
    
    try {
      logger.logRequest(request);
      const response = await handler(request, env, ctx, logger);
      logger.logResponse(response);
      return response;
    } catch (error) {
      logger.logError(error as Error);
      throw error;
    }
  };
};

// Helper function to create a child logger with additional context
export const createChildLogger = (parentContext: Record<string, any>): Logger => {
  const logger = Logger.getInstance();
  
  return {
    ...logger,
    info: (message: string, context?: Record<string, any>) => {
      logger.info(message, { ...parentContext, ...context });
    },
    warn: (message: string, context?: Record<string, any>) => {
      logger.warn(message, { ...parentContext, ...context });
    },
    error: (message: string, context?: Record<string, any>) => {
      logger.error(message, { ...parentContext, ...context });
    },
    debug: (message: string, context?: Record<string, any>) => {
      logger.debug(message, { ...parentContext, ...context });
    },
  } as Logger;
};