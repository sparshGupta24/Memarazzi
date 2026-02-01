
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, HumorStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHumorInstruction = (style: HumorStyle) => {
  switch (style) {
    case 'savage': return "Make it a sharp, funny roast. Be edgy but relatable.";
    case 'wholesome': return "Make it sweet, positive, and heart-warming.";
    case 'sarcastic': return "Make it dry, ironic, and witty.";
    case 'brainrot': return "Use modern slang (aura, rizz, etc.) in a funny way.";
    default: return "Classic internet humor. Relatable 'meirl' style.";
  }
};

export const analyzeFrame = async (base64Image: string, humorStyle: HumorStyle, retries = 2): Promise<AnalysisResult> => {
  const model = "gemini-flash-lite-latest";
  const humorInstruction = getHumorInstruction(humorStyle);
  
  const prompt = `Analyze this person's expression and generate a relatable meme.
  
  CONTEXT: The person is currently looking at their camera.
  STYLE: ${humorStyle.toUpperCase()} - ${humorInstruction}
  
  TASK:
  1. Describe their specific mood and action briefly.
  2. Create a 'memeTitle' (Top text) starting with "POV:", "When you...", or "Me:".
  3. Create a 'memeCaption' (Bottom text) as the funny punchline.
  
  The meme MUST match the person's actual face in the image. 
  If they look bored, the meme is about being bored. 
  If they look happy, it's about winning.
  Keep it simple, funny, and direct.

  Return JSON:
  {
    "mood": "short description",
    "action": "short description",
    "memeTitle": "Top text",
    "memeCaption": "Bottom text"
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
    
    return JSON.parse(text);
  } catch (error: any) {
    if (error?.message?.includes('429') && retries > 0) {
      await sleep(5000);
      return analyzeFrame(base64Image, humorStyle, retries - 1);
    }
    throw error;
  }
};
