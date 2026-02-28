
const extractGeminiErrorMessage = (error: unknown): string | null => {
    if (!error) return null;
    const apiError = error as { message?: string; response?: { error?: { message?: string } } };
    if (apiError.response?.error?.message) {
        return apiError.response.error.message;
    }
    if (apiError.message) {
        return apiError.message;
    }
    return null;
};

type GeminiResponse = {
    text: string | null;
    imageBase64: string | null;
};

interface EditImageRequest {
    action: 'edit';
    prompt: string;
    images: { base64: string; mimeType: string }[];
}

interface GenerateImageRequest {
    action: 'generate';
    prompt: string;
}

type GeminiRequest = EditImageRequest | GenerateImageRequest;

export interface ApiSettings {
    apiKey: string;
    baseUrl: string;
}

const SETTINGS_KEY = 'cis-api-settings';

export const loadApiSettings = (): ApiSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return JSON.parse(stored);
    } catch {}
    return { apiKey: '', baseUrl: '' };
};

export const saveApiSettings = (settings: ApiSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const callGemini = async (payload: GeminiRequest): Promise<GeminiResponse> => {
    const settings = loadApiSettings();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (settings.apiKey) headers['x-api-key'] = settings.apiKey;
    if (settings.baseUrl) headers['x-base-url'] = settings.baseUrl;

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = (data && data.error) ? data.error : 'Failed to process Gemini request.';
            throw new Error(message);
        }

        return {
            text: data?.text ?? null,
            imageBase64: data?.imageBase64 ?? null,
        };
    } catch (error) {
        console.error('Error calling Gemini API via proxy:', error);
        const message = extractGeminiErrorMessage(error) ?? 'Failed to call Gemini API. Please check the console for more details.';
        throw new Error(message);
    }
};


export const editImage = async (
    prompt: string,
    images: { base64: string, mimeType: string }[]
): Promise<{ text: string | null; imageBase64: string | null }> => {
    return callGemini({
        action: 'edit',
        prompt,
        images,
    });
};


export const generateImageFromText = async (
    prompt: string
): Promise<{ text: string | null; imageBase64: string | null }> => {
    return callGemini({
        action: 'generate',
        prompt,
    });
};
