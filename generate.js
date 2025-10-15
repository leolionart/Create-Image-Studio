import { GoogleGenerativeAI } from '@google/genai';

export async function onRequestPost({ request, env }) {
  // Lấy API key từ biến môi trường bí mật của Cloudflare
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  try {
    const reqBody = await request.json();
    const { model, contents, generationConfig } = reqBody;

    if (!model || !contents) {
      return new Response(JSON.stringify({ error: 'model and contents are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const generativeModel = genAI.getGenerativeModel({ model, generationConfig });
    const result = await generativeModel.generateContent({ contents });
    const response = await result.response;

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}