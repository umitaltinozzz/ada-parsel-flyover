export type CapturedFrame = {
  blob: Blob;
  timestampMs: number;
};

export async function captureCanvasFrame(
  canvas: HTMLCanvasElement,
  timestampMs: number,
): Promise<CapturedFrame> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) {
        resolve(value);
      } else {
        reject(new Error("Canvas frame alinamadi."));
      }
    }, "image/png");
  });

  return { blob, timestampMs };
}
