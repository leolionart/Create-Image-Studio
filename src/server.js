import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '50mb' }));

// --- Template Data Layer ---
const DATA_DIR = path.join(__dirname, '..', 'data');
const BUILTIN_PATH = path.join(DATA_DIR, 'built-in-templates.json');
const CUSTOM_PATH = path.join(DATA_DIR, 'custom-templates.json');

const COMMUNITY_DIR = path.join(__dirname, '..', 'public', 'community');

// Ensure data & community directories exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(CUSTOM_PATH)) {
    fs.writeFileSync(CUSTOM_PATH, '[]');
}
if (!fs.existsSync(COMMUNITY_DIR)) {
    fs.mkdirSync(COMMUNITY_DIR, { recursive: true });
}

function saveBase64Image(base64Data, prefix) {
    try {
        let buffer, ext;
        if (base64Data.startsWith('data:')) {
            const match = base64Data.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
            if (!match) return null;
            ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
            buffer = Buffer.from(match[2], 'base64');
        } else {
            ext = 'png';
            buffer = Buffer.from(base64Data, 'base64');
        }
        const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        fs.writeFileSync(path.join(COMMUNITY_DIR, filename), buffer);
        return `/community/${filename}`;
    } catch {
        return null;
    }
}

function readBuiltInTemplates() {
    try {
        return JSON.parse(fs.readFileSync(BUILTIN_PATH, 'utf-8')).map(t => ({ ...t, source: 'built-in' }));
    } catch {
        console.error('Failed to read built-in templates');
        return [];
    }
}

function readCustomTemplates() {
    try {
        return JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf-8')).map(t => ({ ...t, source: 'custom' }));
    } catch {
        return [];
    }
}

function writeCustomTemplates(templates) {
    fs.writeFileSync(CUSTOM_PATH, JSON.stringify(templates, null, 2));
}

// --- Template API Endpoints ---

// GET /api/templates - Return all templates (built-in + custom)
app.get('/api/templates', (req, res) => {
    const builtIn = readBuiltInTemplates();
    const custom = readCustomTemplates();
    const templates = [...builtIn, ...custom];
    const categories = [...new Set(templates.map(t => t.category))].sort();
    res.json({ templates, categories });
});

// POST /api/templates - Add new template (for n8n integration)
app.post('/api/templates', (req, res) => {
    const { title, author, category, prompt, inputsNeeded, inputImages, outputImage, note } = req.body;

    if (!title || !prompt || inputsNeeded === undefined) {
        return res.status(400).json({ error: 'Missing required fields: title, prompt, inputsNeeded' });
    }

    const custom = readCustomTemplates();
    const allBuiltIn = readBuiltInTemplates();
    const maxId = Math.max(999, ...allBuiltIn.map(t => t.id), ...custom.map(t => t.id));

    // Process base64 images: save to disk and replace with file paths
    let processedOutputImage = outputImage || '';
    if (processedOutputImage && (processedOutputImage.startsWith('data:') || processedOutputImage.length > 500)) {
        processedOutputImage = saveBase64Image(processedOutputImage, 'output') || '';
    }
    const processedInputImages = (inputImages || []).map((img, i) => {
        if (img && (img.startsWith('data:') || img.length > 500)) {
            return saveBase64Image(img, `input-${i}`) || img;
        }
        return img;
    });

    const newTemplate = {
        id: maxId + 1,
        title,
        author: author || 'Community',
        category: category || 'Custom',
        inputImages: processedInputImages,
        outputImage: processedOutputImage,
        prompt,
        inputsNeeded: Number(inputsNeeded),
        note: note || undefined,
        source: 'custom',
    };

    custom.push(newTemplate);
    writeCustomTemplates(custom);
    res.status(201).json({ success: true, template: newTemplate });
});

// DELETE /api/templates/:id - Delete a custom template
app.delete('/api/templates/:id', (req, res) => {
    const id = Number(req.params.id);
    const custom = readCustomTemplates();
    const index = custom.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Template not found or is a built-in template' });
    }

    custom.splice(index, 1);
    writeCustomTemplates(custom);
    res.json({ success: true });
});

// --- Admin API ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function requireAdmin(req, res, next) {
    const password = req.headers['x-admin-password'];
    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Mật khẩu admin không đúng.' });
    }
    next();
}

// POST /api/admin/login - Verify admin password
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Mật khẩu không đúng.' });
    }
});

// GET /api/admin/templates - List community templates (admin only)
app.get('/api/admin/templates', requireAdmin, (req, res) => {
    const custom = readCustomTemplates();
    res.json({ templates: custom });
});

// DELETE /api/admin/templates/:id - Delete a community template (admin only)
app.delete('/api/admin/templates/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const custom = readCustomTemplates();
    const index = custom.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Template not found.' });
    }

    // Clean up associated community images
    const template = custom[index];
    const imagesToDelete = [...(template.inputImages || []), template.outputImage].filter(Boolean);
    for (const imgPath of imagesToDelete) {
        if (imgPath.startsWith('/community/')) {
            const fullPath = path.join(__dirname, '..', 'public', imgPath);
            try { fs.unlinkSync(fullPath); } catch { /* ignore */ }
        }
    }

    custom.splice(index, 1);
    writeCustomTemplates(custom);
    res.json({ success: true });
});

// --- Gemini API Proxy ---
app.post('/api/gemini', async (req, res) => {
    // Client-provided settings take priority over server env vars
    const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
    const baseUrl = req.headers['x-base-url'] || process.env.GOOGLE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

    if (!apiKey) {
        return res.status(500).json({ error: 'API key chưa được cấu hình. Vui lòng mở Settings để nhập API key.' });
    }

    const { action, prompt, images } = req.body;
    let upstreamUrl = '';
    let upstreamBody = {};

    try {
        if (action === 'edit') {
            upstreamUrl = `${baseUrl}/v1beta/models/gemini-2.5-flash-image:generateContent`;
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
            upstreamUrl = `${baseUrl}/v1beta/models/imagen-4.0-generate-001:generateImage`;
            upstreamBody = {
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            };
        } else {
            return res.status(400).json({ error: 'Unsupported action.' });
        }

        const upstreamResponse = await fetch(upstreamUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify(upstreamBody),
        });

        const responseText = await upstreamResponse.text();
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            console.error('Failed to parse response:', responseText);
            return res.status(500).json({ error: 'Invalid response from API' });
        }

        if (!upstreamResponse.ok) {
            console.error('Error from Gemini API:', data);
            return res.status(upstreamResponse.status).json({ error: data?.error?.message || 'Gemini API request failed.' });
        }

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

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(__dirname, '..', 'dist');
    app.use(express.static(distDir));

    // Serve community uploaded images
    app.use('/community', express.static(path.join(COMMUNITY_DIR)));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
