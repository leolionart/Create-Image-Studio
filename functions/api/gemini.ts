type GeminiEnv = Record<string, string | undefined>;

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

const getApiKey = (env: GeminiEnv): string | undefined => {
    return env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
};

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

const handleEditImage = async (payload: EditImagePayload, apiKey: string): Promise<Response> => {
    if (!payload.prompt || !Array.isArray(payload.images) || payload.images.length === 0) {
        return sendJson({ error: 'Invalid payload for edit action.' }, 400);
    }

    for (const image of payload.images) {
        if (!image?.base64 || !image?.mimeType) {
            return sendJson({ error: 'Each image must include base64 data and mimeType.' }, 400);
        }
    }

    const mediaParts = payload.images.map((image) => ({
        inlineData: {
            data: image.base64 as string,
            mimeType: image.mimeType as string,
        },
    }));

    const parts = [
        ...mediaParts,
        { text: payload.prompt },
    ];

    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
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
    });

    const data = await upstream.json();

    if (!upstream.ok) {
        const message = data?.error?.message || 'Gemini image edit failed.';
        return sendJson({ error: message }, upstream.status);
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
        return sendJson({ error: 'No content generated.' }, 502);
    }

    return sendJson({ text: textResult, imageBase64: imageResult });
};

const handleGenerateImage = async (payload: GenerateImagePayload, apiKey: string): Promise<Response> => {
    if (!payload.prompt) {
        return sendJson({ error: 'Prompt is required for generate action.' }, 400);
    }

    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImage?key=${apiKey}`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
            prompt: payload.prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
            },
        }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
        const message = data?.error?.message || 'Gemini image generation failed.';
        return sendJson({ error: message }, upstream.status);
    }

    const imageBase64 = data?.generatedImages?.[0]?.image?.imageBytes ?? null;

    if (!imageBase64) {
        return sendJson({ error: 'No image generated.' }, 502);
    }

    return sendJson({ text: null, imageBase64 });
};

export const onRequestPost = async ({ request, env }: { request: Request; env: GeminiEnv }) => {
    const payload = await parseRequest(request);

    if (!payload) {
        return sendJson({ error: 'Invalid JSON body.' }, 400);
    }

    const apiKey = getApiKey(env);

    if (!apiKey) {
        console.error('Gemini API key is not configured.');
        return sendJson({ error: 'Server is not configured with an API key.' }, 500);
    }

    if (payload.action === 'edit') {
        return handleEditImage(payload, apiKey);
    }

    if (payload.action === 'generate') {
        return handleGenerateImage(payload, apiKey);
    }

    return sendJson({ error: 'Unsupported action.' }, 400);
};
