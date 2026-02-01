
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, HumorStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHumorInstruction = (style: HumorStyle) => {
  switch (style) {
    case 'savage': return "Be edgy, dark, and brutally honest. Use dark humor and sharp wit.";
    case 'wholesome': return "Be kind, sweet, and uplifting. Focus on positivity and heart-warming vibes.";
    case 'sarcastic': return "Be incredibly dry and ironic. Use heavy sarcasm and intellectual wit.";
    case 'brainrot': return "Use Gen Alpha/Z slang (skibidi, rizz, fanum tax, etc.) and surreal, nonsensical humor.";
    default: return "Use classic internet humor style, relatable and funny for everyone.";
  }
};

export const analyzeFrame = async (base64Image: string, humorStyle: HumorStyle, retries = 2): Promise<AnalysisResult> => {
  const model = "gemini-flash-lite-latest";
  const humorInstruction = getHumorInstruction(humorStyle);
  
  const prompt = `Analyze this camera frame of a person. 
  1. Identify their current facial expression and overall mood.
  2. Identify their current action or pose.
  3. Recommend a classic or trending internet meme that perfectly matches this specific expression/action.
  4. Create a funny "Meme Caption" for them.
  
  HUMOR STYLE: ${humorStyle.toUpperCase()}
  INSTRUCTION: ${humorInstruction}

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

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const result: AnalysisResult = JSON.parse(text);
    return result;
  } catch (error: any) {
    if (error?.message?.includes('429') && retries > 0) {
      console.warn(`Rate limited. Retrying in 5s... (${retries} retries left)`);
      await sleep(5000);
      return analyzeFrame(base64Image, humorStyle, retries - 1);
    }
    
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
