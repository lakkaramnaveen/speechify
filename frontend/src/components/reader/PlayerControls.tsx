import React from "react";

interface PlayerControlsProps {
  hasAudio: boolean;
  isPlaying: boolean;
  playbackPercent: number;
  currentTimeLabel: string;
  durationLabel: string;
  onPlay(): void;
  onPause(): void;
  onStop(): void;
  onSeek(percent: number): void;
  onDownload(): void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  hasAudio,
  isPlaying,
  playbackPercent,
  currentTimeLabel,
  durationLabel,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onDownload
}) => {
  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlay}
            disabled={!hasAudio || isPlaying}
            className="rounded-full bg-primary-600 text-white text-xs font-semibold px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary-700 transition"
          >
            Play
          </button>
          <button
            onClick={onPause}
            disabled={!hasAudio || !isPlaying}
            className="rounded-full border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Pause
          </button>
          <button
            onClick={onStop}
            disabled={!hasAudio}
            className="rounded-full border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Stop
          </button>
          <button
            onClick={onDownload}
            disabled={!hasAudio}
            className="ml-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Download MP3
          </button>
        </div>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 w-10 text-right">
            {currentTimeLabel}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={playbackPercent}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            disabled={!hasAudio}
            className="flex-1 accent-primary-600"
          />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 w-10">
            {durationLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

