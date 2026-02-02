
import { GoogleGenAI, Type } from "@google/genai";
import { VideoData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class VideoProcessor {
  static parseUrl(url: string): { id: string; type: VideoData['type']; embedUrl: string } {
    const trimmed = url.trim();
    const ytRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const ytMatch = trimmed.match(ytRegex);
    if (ytMatch && ytMatch[7].length === 11) {
      return { id: ytMatch[7], type: 'youtube', embedUrl: ytMatch[7] };
    }
    if (trimmed.includes('bilibili.com')) {
      const match = trimmed.match(/video\/(BV[a-zA-Z0-9]+)/);
      const id = match ? match[1] : '';
      return { id, type: 'bilibili', embedUrl: `https://player.bilibili.com/player.html?bvid=${id}&page=1&high_quality=1&danmaku=0` };
    }
    return { id: 'custom', type: 'other', embedUrl: trimmed };
  }

  static async processVideo(url: string): Promise<VideoData> {
    const { id, type, embedUrl } = this.parseUrl(url);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ACT AS AN EXPERT LINGUIST.
      1. ACCESS the video at this URL: ${url}
      2. USE Google Search to find the PRECISE transcript, lyrics, or captions for this SPECIFIC video content.
      3. EXTRACT 40-60 logical sentences that span the ENTIRE duration of the video.
      4. GENERATE a JSON response. For each sentence, provide:
         - sentence_id
         - start time in seconds (float)
         - end time in seconds (float)
         - text in English (en), Chinese (zh), and Japanese (jp).
      
      DO NOT HALLUCINATE. If you cannot find the exact transcript, find the most detailed summary or similar content and map it accurately to timestamps.
      THE OUTPUT MUST BE VALID JSON ONLY.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence_id: { type: Type.STRING },
                  start: { type: Type.NUMBER },
                  end: { type: Type.NUMBER },
                  text: {
                    type: Type.OBJECT,
                    properties: {
                      en: { type: Type.STRING },
                      zh: { type: Type.STRING },
                      jp: { type: Type.STRING }
                    },
                    required: ["en", "zh", "jp"]
                  }
                },
                required: ["sentence_id", "start", "end", "text"]
              }
            }
          },
          required: ["sentences"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      video_id: id,
      source_url: embedUrl,
      type,
      sentences: parsed.sentences || []
    };
  }
}
