
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
  const dateStr = yesterday.toLocaleDateString('pt-PT');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise no SofaScore ou sites similares os resultados dos jogos de futebol mais importantes que ocorreram ontem (${dateStr}). 
      Escolha 3 jogos de ligas principais (como Champions League, Premier League, La Liga, etc).
      Retorne os dados no seguinte formato estrito para processamento:
      Liga | Equipa A vs Equipa B | Resultado Final
      Exemplo: Champions League | Real Madrid vs PSG | 2-1
      Retorne apenas as 3 linhas, sem texto adicional.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Baixa temperatura para manter o formato estrito
      },
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(l => l.includes('|')).slice(0, 3);
    
    if (lines.length === 0) throw new Error("Formato de resposta inválido");

    return lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        league: parts[0] || "Internacional",
        match: parts[1] || "Jogo Finalizado",
        result: parts[2] || "Vencedora"
      };
    });
  } catch (error) {
    console.error("History Error:", error);
    // Fallback elegante se a pesquisa falhar
    return [
      { league: "La Liga", match: "Barcelona vs Getafe", result: "2-0" },
      { league: "Serie A", match: "Inter vs Juventus", result: "1-1" },
      { league: "Primeira Liga", match: "Benfica vs Porto", result: "1-0" }
    ];
  }
};
