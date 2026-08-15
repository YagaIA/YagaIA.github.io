import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Configura os cabeçalhos para permitir o efeito de digitação fluida (Streaming)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  try {
    const { mensagem } = req.body;
    
    // Inicializa a IA usando a chave que você salvou na Vercel
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Solicita a resposta em formato de Stream
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: [
        { 
          role: 'user', 
          parts: [{ text: `Você é o assistente do Portal da Insistência Cósmica. Responda adotando um tom extremamente analítico, computacional, frio e cirúrgico. Responda à seguinte solicitação: ${mensagem}` }] 
        }
      ],
    });

    // Envia cada pedaço da resposta para a tela do usuário assim que o Gemini gera
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }
    
    // Fecha a conexão após terminar de falar
    res.end();

  } catch (error) {
    res.status(500).send(`[Erro no Servidor]: ${error.message}`);
  }
}
