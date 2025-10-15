import { Env, ApiResponse } from '../types';
import { withLogger, Logger } from '../utils/logger';
import { withAuth } from '../middleware/auth';
import { 
  ValidationError, 
  ExternalServiceError, 
  createErrorResponse,
  handleValidationError 
} from '../utils/errorHandler';
import { getApiKey, validateApiKey } from './config';

export const config = {
    regions: ['iad'] as const,
};

interface EditImagePayload {
    action: 'edit';
    prompt?: string;
    images?: { base64?: string; mimeType?: string }[];
}

interface GenerateImagePayload {
    action: 'generate';
    prompt?: string;
}

type GeminiPayload = EditImagePayload | GenerateImagePayload;

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

const parseRequest = async (request: Request): Promise<GeminiPayload | null> => {
    try {
        return await request.json();
    } catch {
        return null;
    }
};

const sendJson = (body: unknown, status = 200): Response => {
    return new Response(JSON.stringify(body), {
        status,
        headers: JSON_HEADERS,
    });
};

const validateEditImagePayload = (payload: EditImagePayload): void => {
    if (!payload.prompt || !Array.isArray(payload.images) || payload.images.length === 0) {
        throw new ValidationError('Invalid payload for edit action. Prompt and at least one image are required.');
    }

    for (const image of payload.images) {
        if (!image?.base64 || !image?.mimeType) {
            throw new ValidationError('Each image must include base64 data and mimeType.');
        }
    }
};

const validateGenerateImagePayload = (payload: GenerateImagePayload): void => {
    if (!payload.prompt) {
        throw new ValidationError('Prompt is required for generate action.');
    }
};

const handleEditImage = async (payload: EditImagePayload, apiKey: string, logger: Logger): Promise<Response> => {
    const startTime = Date.now();
    
    try {
        logger.info('Processing image edit request', {
            promptLength: payload.prompt?.length,
            imageCount: payload.images?.length,
        });

        validateEditImagePayload(payload);

        const parts = [
            ...payload.images!.map((image) => ({
                inlineData: {
                    data: image.base64 as string,
                    mimeType: image.mimeType as string,
                },
            })),
            { text: payload.prompt },
        ];

        const requestInit: RequestInit & { cf?: any } = {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts,
                    },
                ],
                generationConfig: {
                    responseModalities: ['IMAGE', 'TEXT'],
                },
            }),
            cf: {
                cacheTtl: 0,
                cacheEverything: false,
                colocationOverride: 'IAD',
            },
        };

        const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, requestInit);

        const data = await upstream.json();
        const responseTime = Date.now() - startTime;

        logger.logApiCall('Gemini Image Edit', 'gemini-2.5-flash-image', responseTime, upstream.ok);

        if (!upstream.ok) {
            const message = data?.error?.message || 'Gemini image edit failed.';
            logger.error('Gemini image edit API error', {
                status: upstream.status,
                message,
                responseTime,
            });
            throw new ExternalServiceError('Gemini API', message, upstream.status);
        }

        let textResult: string | null = null;
        let imageResult: string | null = null;

        const candidate = data?.candidates?.[0];
        const contentParts = candidate?.content?.parts;

        if (Array.isArray(contentParts)) {
            for (const part of contentParts) {
                if (typeof part.text === 'string') {
                    textResult = part.text;
                } else if (part.inlineData?.data) {
                    imageResult = part.inlineData.data;
                }
            }
        } else if (typeof data?.text === 'string') {
            textResult = data.text;
        }

        if (!imageResult && !textResult) {
            logger.warn('No content generated from Gemini API');
            throw new ExternalServiceError('Gemini API', 'No content generated.', 502);
        }

        const response: ApiResponse = {
            success: true,
            data: { text: textResult, imageBase64: imageResult },
            message: 'Image edited successfully',
            timestamp: new Date().toISOString(),
        };

        logger.info('Image edit completed successfully', {
            hasText: !!textResult,
            hasImage: !!imageResult,
            responseTime,
        });

        return sendJson(response);
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('Image edit failed', {
            error: (error as Error).message,
            responseTime,
        });
        throw error;
    }
};

const handleGenerateImage = async (payload: GenerateImagePayload, apiKey: string, logger: Logger): Promise<Response> => {
    const startTime = Date.now();
    
    try {
        logger.info('Processing image generation request', {
            promptLength: payload.prompt?.length,
        });

        validateGenerateImagePayload(payload);

        const requestInit: RequestInit & { cf?: any } = {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({
                prompt: payload.prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            }),
            cf: {
                cacheTtl: 0,
                cacheEverything: false,
                colocationOverride: 'IAD',
            },
        };

        const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImage?key=${apiKey}`, requestInit);

        const data = await upstream.json();
        const responseTime = Date.now() - startTime;

        logger.logApiCall('Gemini Image Generation', 'imagen-4.0-generate-001', responseTime, upstream.ok);

        if (!upstream.ok) {
            const message = data?.error?.message || 'Gemini image generation failed.';
            logger.error('Gemini image generation API error', {
                status: upstream.status,
                message,
                responseTime,
            });
            throw new ExternalServiceError('Gemini API', message, upstream.status);
        }

        const imageBase64 = data?.generatedImages?.[0]?.image?.imageBytes ?? null;

        if (!imageBase64) {
            logger.warn('No image generated from Gemini API');
            throw new ExternalServiceError('Gemini API', 'No image generated.', 502);
        }

        const response: ApiResponse = {
            success: true,
            data: { text: null, imageBase64 },
            message: 'Image generated successfully',
            timestamp: new Date().toISOString(),
        };

        logger.info('Image generation completed successfully', {
            responseTime,
        });

        return sendJson(response);
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('Image generation failed', {
            error: (error as Error).message,
            responseTime,
        });
        throw error;
    }
};

export const onRequestPost = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
    logger.info('Gemini API endpoint accessed');
    
    try {
        const payload = await parseRequest(request);

        if (!payload) {
            logger.warn('Invalid JSON body received');
            return handleValidationError('Invalid JSON body.');
        }

        const apiKey = getApiKey(env);

        if (!apiKey) {
            logger.error('Gemini API key is not configured');
            return createErrorResponse(new Error('Server is not configured with an API key.'), logger.getRequestId());
        }

        if (!validateApiKey(apiKey)) {
            logger.error('Invalid Gemini API key format');
            return createErrorResponse(new Error('Invalid API key format.'), logger.getRequestId());
        }

        if (payload.action === 'edit') {
            return handleEditImage(payload, apiKey, logger);
        }

        if (payload.action === 'generate') {
            return handleGenerateImage(payload, apiKey, logger);
        }

        logger.warn('Unsupported action requested', { action: (payload as any).action });
        return handleValidationError('Unsupported action.');
    } catch (error) {
        logger.error('Request processing failed', {
            error: (error as Error).message,
            stack: (error as Error).stack,
        });
        
        if (error instanceof ValidationError || error instanceof ExternalServiceError) {
            return createErrorResponse(error, logger.getRequestId());
        }
        
        return createErrorResponse(error as Error, logger.getRequestId());
    }
}));

export const onRequestOptions = withLogger(withAuth(async (request: Request, env: Env, ctx: any, logger: Logger): Promise<Response> => {
    logger.debug('Gemini API CORS preflight request');
    
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}));
