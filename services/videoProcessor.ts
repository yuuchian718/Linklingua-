import { GoogleGenAI, Type } from "@google/genai";
import { VideoData } from "../types";

// 允许在没有 Key 的情况下初始化，但实际调用会检查
const apiKey = process.env.API_KEY || "";

const MOCK_SENTENCES = [
  {
    sentence_id: "1",
    start: 0,
    end: 5,
    text: {
      en: "Welcome to this advanced language learning tutorial.",
      zh: "欢迎来到这个高级语言学习教程。",
      jp: "この高度な語学学習チュートリアルへようこそ。"
    }
  },
  {
    sentence_id: "2",
    start: 5.1,
    end: 10,
    text: {
      en: "Today we will learn how to analyze any video content.",
      zh: "今天我们将学习如何分析任何视频内容。",
      jp: "今日は、あらゆるビデオコンテンツを分析する方法を学びます。"
    }
  },
  {
    sentence_id: "3",
    start: 10.1,
    end: 15,
    text: {
      en: "AI makes language learning faster and more intuitive.",
      zh: "人工智能让语言学习变得更快、更直观。",
      jp: "AIは語学学習をより速く、より直感的にします。"
    }
  }
];

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

    // 如果没有 API_KEY，返回 Mock 数据以供演示
    if (!apiKey || apiKey === "") {
      console.warn("No API_KEY found. Using mock data for demonstration.");
      return {
        video_id: id,
        source_url: embedUrl,
        type,
        sentences: MOCK_SENTENCES
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `ACT AS AN EXPERT LINGUIST.
        1. ACCESS the video at this URL: ${url}
        2. USE Google Search to find the PRECISE transcript, lyrics, or captions for this SPECIFIC video content.
        3. EXTRACT 20-30 logical sentences that span the duration of the video.
        4. GENERATE a JSON response. 
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
        sentences: parsed.sentences || MOCK_SENTENCES
      };
    } catch (e) {
      console.error("AI Processing failed, falling back to mock data.", e);
      return {
        video_id: id,
        source_url: embedUrl,
        type,
        sentences: MOCK_SENTENCES
      };
    }
  }
}