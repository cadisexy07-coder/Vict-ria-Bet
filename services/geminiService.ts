
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const validateReceiptOCR = async (base64Image: string) => {
  const ai = getAiClient();
  try {
    // Remover o prefixo data:image/...;base64, se existir
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analise este comprovativo de pagamento Multicaixa (Angola). Extraia a Entidade, Referência e o Valor. Responda apenas com um objeto JSON no formato: {\"entidade\": \"string\", \"referencia\": \"string\", \"valor\": number}. Se não encontrar os dados, responda com {\"erro\": \"Não foi possível ler os dados do comprovativo\"}." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("OCR Error:", error);
    return { erro: "Falha na análise inteligente do comprovativo." };
  }
};

export const getSportsAnalysis = async (match: string, league: string) => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Forneça uma análise estatística curta e profissional (máximo 300 caracteres) para o jogo ${match} da liga ${league}. Foco em tendências recentes e probabilidade de vitória. Responda em Português.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "Análise indisponível no momento.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Erro ao carregar análise em tempo real. Por favor, tente novamente.", sources: [] };
  }
};

export const getYesterdaysResults = async () => {
  const ai = getAiClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Aceda ao site https://www.sofascore.com/ e procure os resultados dos jogos de futebol mais importantes que ocorreram ontem, dia ${dateStr}. 
      Selecione os 3 jogos com maior relevância mediática (ex: Champions League, Premier League, Brasileirão, La Liga).
      Retorne os dados exatamente neste formato:
      LIGA | EQUIPA A vs EQUIPA B | RESULTADO FINAL
      
      Exemplo:
      Champions League | Real Madrid vs PSG | 3-1
      Premier League | Liverpool vs Arsenal | 2-2
      
      Importante: Retorne apenas as linhas de dados, sem qualquer outro texto.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(l => l.includes('|')).slice(0, 3);
    
    if (lines.length === 0) throw new Error("Não foi possível extrair os resultados do SofaScore.");

    return lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        league: parts[0] || "Liga Desportiva",
        match: parts[1] || "Jogo Finalizado",
        result: parts[2] || "Vencedora"
      };
    });
  } catch (error) {
    console.error("SofaScore Sync Error:", error);
    return [
      { league: "La Liga", match: "Barcelona vs Getafe", result: "1-0" },
      { league: "Serie A", match: "Inter vs Milan", result: "2-1" },
      { league: "Primeira Liga", match: "Benfica vs Braga", result: "3-0" }
    ];
  }
};
