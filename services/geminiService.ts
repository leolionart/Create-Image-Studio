
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface ImagePart {
    inlineData: {
        data: string;
        mimeType: string;
    };
}

const fileToGenerativePart = (base64: string, mimeType: string): ImagePart => ({
    inlineData: {
        data: base64,
        mimeType
    }
});

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

export const editImage = async (
    prompt: string,
    images: { base64: string, mimeType: string }[]
): Promise<{ text: string | null; imageBase64: string | null }> => {
    try {
        const imageParts = images.map(img => fileToGenerativePart(img.base64, img.mimeType));
        const textPart = { text: prompt };

        const parts: Part[] = [...imageParts, textPart];

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
                role: 'user',
                parts,
            }],
            generationConfig: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        let textResult: string | null = null;
        let imageResult: string | null = null;
        
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    textResult = part.text;
                } else if (part.inlineData && part.inlineData.data) {
                    imageResult = part.inlineData.data;
                }
            }
        } else if (response.text) {
            textResult = response.text;
        }

        if (!imageResult && !textResult) {
            throw new Error("No content generated. The model's response might have been blocked.");
        }

        return { text: textResult, imageBase64: imageResult };

    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        const message = extractGeminiErrorMessage(error) ?? "Failed to edit image. Please check the console for more details.";
        throw new Error(message);
    }
};


export const generateImageFromText = async (
    prompt: string
): Promise<{ text: string | null; imageBase64: string | null }> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
            },
        });

        const imageBase64 = response.generatedImages?.[0]?.image?.imageBytes ?? null;
        
        if (!imageBase64) {
             throw new Error("No image generated. The model's response might have been blocked.");
        }

        return { text: null, imageBase64: imageBase64 };

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        const message = extractGeminiErrorMessage(error) ?? "Failed to generate image. Please check the console for more details.";
        throw new Error(message);
    }
};
