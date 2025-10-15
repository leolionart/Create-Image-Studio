import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Tải các biến môi trường từ file .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware để parse JSON body
app.use(express.json({ limit: '10mb' }));

// API Proxy Endpoint for Gemini
app.post('/api/gemini', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { action, prompt, images } = req.body;
    let upstreamUrl = '';
    let upstreamBody = {};

    try {
        if (action === 'edit') {
            upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
            const parts = [
                ...images.map((image) => ({
                    inlineData: { data: image.base64, mimeType: image.mimeType },
                })),
                { text: prompt },
            ];
            upstreamBody = {
                contents: [{ role: 'user', parts }],
                generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
            };
        } else if (action === 'generate') {
            upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImage?key=${apiKey}`;
            upstreamBody = {
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            };
        } else {
            return res.status(400).json({ error: 'Unsupported action.' });
        }

        const upstreamResponse = await fetch(upstreamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(upstreamBody),
        });

        const data = await upstreamResponse.json();

        if (!upstreamResponse.ok) {
            console.error('Error from Gemini API:', data);
            return res.status(upstreamResponse.status).json({ error: data?.error?.message || 'Gemini API request failed.' });
        }
        
        // Trích xuất và gửi lại kết quả cho client
        let responsePayload = {};
        if (action === 'edit') {
            const candidate = data?.candidates?.[0];
            const contentParts = candidate?.content?.parts;
            let textResult = null;
            let imageResult = null;
            if (Array.isArray(contentParts)) {
                for (const part of contentParts) {
                    if (part.text) textResult = part.text;
                    else if (part.inlineData?.data) imageResult = part.inlineData.data;
                }
            }
            responsePayload = { text: textResult, imageBase64: imageResult };
        } else if (action === 'generate') {
            const imageBase64 = data?.generatedImages?.[0]?.image?.imageBytes ?? null;
            responsePayload = { text: null, imageBase64 };
        }

        res.json(responsePayload);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// Phục vụ các file tĩnh của React
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all để trả về index.html cho các route của React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
