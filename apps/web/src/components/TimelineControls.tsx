import { Play, Settings2 } from "lucide-react";
import type { CameraPath } from "../types/camera";
import type { VideoSettings } from "../types/video";

type TimelineControlsProps = {
  disabled: boolean;
  isPlaying: boolean;
  progress: number;
  cameraPath: CameraPath | null;
  settings: VideoSettings;
  onPlay: () => void;
  onCameraPathChange: (path: CameraPath) => void;
  onSettingsChange: (settings: VideoSettings) => void;
};

export function TimelineControls({
  disabled,
  isPlaying,
  progress,
  cameraPath,
  settings,
  onPlay,
  onCameraPathChange,
  onSettingsChange,
}: TimelineControlsProps) {
  const updateCameraPath = (updates: Partial<CameraPath>) => {
    if (!cameraPath) {
      return;
    }

    onCameraPathChange({
      ...cameraPath,
      ...updates,
    });
  };

  return (
    <section className="panel-section">
      <div className="section-title">
        <h2>Kamera</h2>
        <span>{Math.round(progress * 100)}%</span>
      </div>

      <div className="timeline-track" aria-label="Animasyon ilerlemesi">
        <span style={{ width: `${progress * 100}%` }} />
      </div>

      {cameraPath ? (
        <div className="settings-grid">
          <label>
            <span>Baslangic zoom</span>
            <input
              type="number"
              min={8}
              max={20}
              step={0.1}
              value={round(cameraPath.startZoom)}
              onChange={(event) =>
                updateCameraPath({ startZoom: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span>Bitis zoom</span>
            <input
              type="number"
              min={8}
              max={22}
              step={0.1}
              value={round(cameraPath.endZoom)}
              onChange={(event) =>
                updateCameraPath({ endZoom: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span>Pitch</span>
            <input
              type="number"
              min={0}
              max={75}
              step={1}
              value={Math.round(cameraPath.pitch)}
              onChange={(event) =>
                updateCameraPath({ pitch: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span>Orbit derece</span>
            <input
              type="number"
              min={90}
              max={720}
              step={15}
              value={Math.round(cameraPath.bearingEnd - cameraPath.bearingStart)}
              onChange={(event) =>
                updateCameraPath({
                  bearingEnd:
                    cameraPath.bearingStart + Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            <span>Baslangic acisi</span>
            <input
              type="number"
              min={-360}
              max={360}
              step={5}
              value={Math.round(cameraPath.bearingStart)}
              onChange={(event) => {
                const nextStart = Number(event.target.value);
                const orbit = cameraPath.bearingEnd - cameraPath.bearingStart;

                updateCameraPath({
                  bearingStart: nextStart,
                  bearingEnd: nextStart + orbit,
                });
              }}
            />
          </label>
        </div>
      ) : null}

      <div className="settings-grid">
        <label>
          <span>Sure</span>
          <input
            type="number"
            min={10}
            max={20}
            value={settings.durationSeconds}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                durationSeconds: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          <span>FPS</span>
          <input
            type="number"
            min={24}
            max={60}
            value={settings.fps}
            onChange={(event) =>
              onSettingsChange({ ...settings, fps: Number(event.target.value) })
            }
          />
        </label>
        <label>
          <span>Format</span>
          <select
            value={settings.format}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                format: event.target.value as VideoSettings["format"],
              })
            }
          >
            <option value="webm">WebM</option>
            <option value="mp4">MP4</option>
          </select>
        </label>
        <label>
          <span>Kalite</span>
          <select
            value={settings.quality}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                quality: event.target.value as VideoSettings["quality"],
              })
            }
          >
            <option value="draft">Taslak</option>
            <option value="standard">Standart</option>
            <option value="high">Yuksek</option>
          </select>
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={settings.includeTitleCards}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                includeTitleCards: event.target.checked,
              })
            }
          />
          <span>Intro/outro</span>
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={settings.motionTrail}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                motionTrail: event.target.checked,
              })
            }
          />
          <span>Motion trail</span>
        </label>
      </div>

      <button
        className="primary-button"
        type="button"
        disabled={disabled}
        onClick={onPlay}
      >
        {isPlaying ? <Settings2 size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        {isPlaying ? "Oynatiliyor" : "Flyover preview"}
      </button>
    </section>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
