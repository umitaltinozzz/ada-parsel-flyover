import { useState } from "react";
import type { Map } from "maplibre-gl";
import { Download, LoaderCircle, Video } from "lucide-react";
import { exportVideo } from "../render/exportVideo";
import type { VideoSettings } from "../types/video";
import type { VideoOverlayMetadata } from "../types/video";

type VideoExportButtonProps = {
  disabled: boolean;
  map: Map | null;
  settings: VideoSettings;
  metadata: VideoOverlayMetadata;
  onExportPlay: () => Promise<void>;
};

export function VideoExportButton({
  disabled,
  map,
  settings,
  metadata,
  onExportPlay,
}: VideoExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!map || disabled || isExporting) {
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      const result = await exportVideo(map, settings, onExportPlay, metadata);
      const filename = `ada-parsel-flyover.${result.extension}`;
      setDownloadUrl(result.url);
      setDownloadName(filename);

      const anchor = document.createElement("a");
      anchor.href = result.url;
      anchor.download = filename;
      anchor.click();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Video export basarisiz.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="panel-section export-section">
      <button
        className="primary-button"
        type="button"
        disabled={disabled || isExporting}
        onClick={handleExport}
      >
        {isExporting ? (
          <LoaderCircle className="spin" size={18} aria-hidden="true" />
        ) : (
          <Video size={18} aria-hidden="true" />
        )}
        {isExporting ? "Video uretiliyor" : "Video export et"}
      </button>

      {downloadUrl && downloadName ? (
        <a className="download-link" href={downloadUrl} download={downloadName}>
          <Download size={16} aria-hidden="true" />
          Son videoyu indir
        </a>
      ) : null}

      {error ? <p className="inline-error">{error}</p> : null}
    </section>
  );
}
