import type { Map } from "maplibre-gl";
import type { VideoSettings } from "../types/video";
import type { VideoOverlayMetadata } from "../types/video";

export type VideoExportResult = {
  url: string;
  blob: Blob;
  extension: "mp4" | "webm";
};

export async function exportVideo(
  map: Map,
  settings: VideoSettings,
  play: () => Promise<void>,
  metadata: VideoOverlayMetadata,
): Promise<VideoExportResult> {
  const mapCanvas = map.getCanvas();
  const canvas = document.createElement("canvas");
  canvas.width = settings.width;
  canvas.height = settings.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Video canvas olusturulamadi.");
  }

  const mimeType = pickMimeType(settings.format);
  const stream = canvas.captureStream(settings.fps);
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: bitrateForQuality(settings.quality),
  });

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onerror = (event) => reject(event.error);
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  let animationFrame = 0;
  const renderStartedAt = performance.now();
  const render = () => {
    const elapsed = performance.now() - renderStartedAt;
    const progress = Math.min(elapsed / (settings.durationSeconds * 1000), 1);

    drawCompositeFrame(context, mapCanvas, settings, metadata, progress);
    animationFrame = requestAnimationFrame(render);
  };

  render();
  recorder.start(250);
  await play();
  cancelAnimationFrame(animationFrame);
  drawCompositeFrame(context, mapCanvas, settings, metadata, 1);

  if (recorder.state !== "inactive") {
    recorder.stop();
  }

  stream.getTracks().forEach((track) => track.stop());
  const blob = await stopped;

  return {
    blob,
    url: URL.createObjectURL(blob),
    extension: mimeType.includes("mp4") ? "mp4" : "webm",
  };
}

function pickMimeType(format: VideoSettings["format"]): string {
  const preferred =
    format === "mp4"
      ? ["video/mp4;codecs=h264", "video/mp4", "video/webm;codecs=vp9"]
      : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

  return (
    preferred.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ??
    "video/webm"
  );
}

function bitrateForQuality(quality: VideoSettings["quality"]): number {
  if (quality === "high") {
    return 8_000_000;
  }

  if (quality === "draft") {
    return 2_500_000;
  }

  return 5_000_000;
}

function drawCompositeFrame(
  context: CanvasRenderingContext2D,
  mapCanvas: HTMLCanvasElement,
  settings: VideoSettings,
  metadata: VideoOverlayMetadata,
  progress: number,
): void {
  if (settings.motionTrail && progress > 0.05 && progress < 0.94) {
    context.fillStyle = "rgba(8, 16, 18, 0.18)";
    context.fillRect(0, 0, settings.width, settings.height);
  } else {
    context.clearRect(0, 0, settings.width, settings.height);
  }

  context.globalAlpha = settings.motionTrail && progress > 0.05 && progress < 0.94 ? 0.88 : 1;
  drawCover(context, mapCanvas, settings.width, settings.height);
  context.globalAlpha = 1;

  if (!settings.includeTitleCards) {
    return;
  }

  if (progress < 0.16) {
    drawTitleCard(context, settings, metadata, 1 - progress / 0.16, "intro");
  } else if (progress > 0.88) {
    drawTitleCard(context, settings, metadata, (progress - 0.88) / 0.12, "outro");
  }
}

function drawCover(
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  width: number,
  height: number,
): void {
  const sourceRatio = source.width / source.height;
  const targetRatio = width / height;
  const drawWidth = sourceRatio > targetRatio ? height * sourceRatio : width;
  const drawHeight = sourceRatio > targetRatio ? height : width / sourceRatio;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
}

function drawTitleCard(
  context: CanvasRenderingContext2D,
  settings: VideoSettings,
  metadata: VideoOverlayMetadata,
  intensity: number,
  mode: "intro" | "outro",
): void {
  const alpha = Math.min(1, Math.max(0, intensity));
  const width = settings.width;
  const height = settings.height;
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgba(8, 20, 22, ${0.72 * alpha})`);
  gradient.addColorStop(1, `rgba(8, 20, 22, ${0.28 * alpha})`);

  context.save();
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = alpha;
  context.fillStyle = "#ffffff";
  context.textBaseline = "alphabetic";
  context.font = `800 ${Math.round(width * 0.044)}px Inter, system-ui, sans-serif`;
  context.fillText(metadata.title, width * 0.07, height * 0.43);

  if (metadata.subtitle) {
    context.font = `600 ${Math.round(width * 0.021)}px Inter, system-ui, sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 0.84)";
    context.fillText(metadata.subtitle, width * 0.07, height * 0.49);
  }

  context.font = `700 ${Math.round(width * 0.015)}px Inter, system-ui, sans-serif`;
  context.fillStyle = "rgba(240, 180, 41, 0.94)";
  context.fillText(
    mode === "intro" ? "Drone-style flyover basliyor" : "Ada Parsel Flyover",
    width * 0.07,
    height * 0.57,
  );
  context.restore();
}
