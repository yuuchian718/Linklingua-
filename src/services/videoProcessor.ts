import { VideoData } from "../types";

export class VideoProcessor {
  static async processVideo(url: string): Promise<VideoData> {
    // ⚠️ 这是临时假数据（保证页面能跑）
    return {
      url,
      sentences: [
        {
          start: 0,
          end: 3,
          text: "This is a demo sentence."
        },
        {
          start: 3,
          end: 6,
          text: "The real video processing will be added later."
        }
      ]
    };
  }
}

