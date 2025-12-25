import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates text response using Gemini 3 series
 */
export async function generateText(model: string, history: any[], prompt: string) {
  try {
    const chat = ai.chats.create({
      model: model,
      history: history, 
      config: {
        systemInstruction: "You are Hrilagpt, a helpful, professional, and intelligent AI assistant. You answer concisely and professionally.",
      }
    });
    
    // We are not using streaming for simplicity in this specific "replace" request to keep state management easy,
    // but typically you'd use sendMessageStream.
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
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

/**
 * Helper to decode PCM to AudioBuffer for playback (since browser <audio> doesn't play raw PCM)
 * Note: For a simpler implementation in a React component without complex AudioWorklets, 
 * we might rely on the fact that standard HTML5 audio doesn't play PCM easily.
 * However, Gemini TTS returns raw PCM. 
 * 
 * We will return the raw base64 and handle decoding in the component.
 */