import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const { mensagem } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: [
        { 
          role: 'user', 
          parts: [{ text: `Você é o assistente do Portal da Insistência Cósmica. Responda adotando um tom extremamente analítico, computacional, frio e cirúrgico. Responda à seguinte solicitação: ${mensagem}` }] 
        }
      ],
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
