
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFrame = async (base64Image: string): Promise<{ result: AnalysisResult, sourceUrl?: string, memeImageUrl?: string }> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this camera frame of a person. 
  1. Identify their current facial expression and overall mood.
  2. Identify their current action or pose.
  3. Recommend a classic or trending internet meme that perfectly matches this specific expression/action.
  4. Create a funny "Meme Caption" for them.
  
  Return the analysis in valid JSON format with the following keys:
  {
    "mood": "Short description of mood",
    "action": "Short description of action",
    "memeTitle": "Name of the matching meme",
    "memeCaption": "A funny relatable caption"
  }`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            action: { type: Type.STRING },
            memeTitle: { type: Type.STRING },
            memeCaption: { type: Type.STRING },
          },
          required: ["mood", "action", "memeTitle", "memeCaption"]
        }
      }
    });

    const result: AnalysisResult = JSON.parse(response.text || '{}');

    // Second pass: Use Search Grounding to find an actual image/source for the meme
    const searchResponse = await ai.models.generateContent({
      model,
      contents: `Find a high-quality image URL or official source for the internet meme: "${result.memeTitle}". Just provide a link to the meme's page or an image.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrl = groundingChunks?.[0]?.web?.uri;

    return { 
      result, 
      sourceUrl,
      // We don't have a direct "image URL" from search grounding as a simple string, 
      // but we can use picsum or a placeholder if search results are thin, 
      // or just the first grounding link as an attribution.
      memeImageUrl: sourceUrl
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
