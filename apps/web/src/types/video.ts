export type VideoSettings = {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
  format: "mp4" | "webm";
  quality: "draft" | "standard" | "high";
  includeTitleCards: boolean;
  motionTrail: boolean;
};

export type VideoOverlayMetadata = {
  title: string;
  subtitle?: string;
};

export const defaultVideoSettings: VideoSettings = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationSeconds: 15,
  format: "webm",
  quality: "standard",
  includeTitleCards: true,
  motionTrail: true,
};
