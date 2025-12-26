import { GoogleGenAI, Modality } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

// Lazy initialization to prevent app crash if API key is missing at startup
const getAiClient = () => {
  if (!aiClient) {
    // Attempt to retrieve API Key from various possible locations
    // 1. window.process.env (our polyfill)
    // 2. process.env (bundler injected)
    let apiKey = '';
    
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
      apiKey = (window as any).process.env.API_KEY;
    } else if (typeof process !== 'undefined' && process.env?.API_KEY) {
      apiKey = process.env.API_KEY;
    }

    if (!apiKey) {
      console.error("API Key is missing. Please check index.html polyfill or environment variables.");
      throw new Error("API Key is missing. Please check your configuration.");
    }
    
    aiClient = new GoogleGenAI({ apiKey: apiKey });
  }
  return aiClient;
};

/**
 * Generates text response using Gemini 3 series
 */
export async function generateText(model: string, history: any[], prompt: string) {
  try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: model,
      history: history, 
      config: {
        systemInstruction: "You are Hrilagpt, a helpful, professional, and intelligent AI assistant. You answer concisely and professionally.",
      }
    });
    
    const response = await chat.sendMessage({ message: prompt });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Text generation failed:", error);
    throw error;
  }
}

/**
 * Generates an image using ZineGPT (Gemini Image model)
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const ai = getAiClient();
    // Use the array format for contents to ensure compatibility
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        { 
          role: 'user',
          parts: [{ text: prompt }] 
        }
      ],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
}

/**
 * Generates speech from text
 */
export async function generateSpeech(text: string): Promise<string> {
  try {
    const ai = getAiClient();
    // Truncate text if too long for a single TTS request to avoid limits/latency
    const safeText = text.slice(0, 500); 

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    
    return `data:audio/pcm;base64,${base64Audio}`;
  } catch (error) {
    console.error("Speech generation failed:", error);
    throw error;
  }
}