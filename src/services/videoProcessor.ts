// src/services/videoProcessor.ts

import { VideoData } from "../types";

export class VideoProcessor {
  static async processVideo(url: string): Promise<VideoData> {
    console.log("VideoProcessor.processVideo called with:", url);

    // 🔴 先返回一个假的数据，验证整条链路
    return {
      videoId: "test",
      sentences: [
        {
          text: "This is a test sentence.",
          start: 0,
          end: 3,
          jp: "これはテストです",
          zh: "这是一个测试",
          en: "This is a test",
        },
      ],
    };
  }
}
