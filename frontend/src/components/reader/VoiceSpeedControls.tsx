import React from "react";
import type { VoiceOption } from "../../types/tts";

interface VoiceSpeedControlsProps {
  voices: VoiceOption[];
  selectedVoiceId: string;
  onVoiceChange(id: string): void;
  speedOptions: { value: number; label: string }[];
  speed: number;
  onSpeedChange(value: number): void;
  disableGenerate: boolean;
  isGenerating: boolean;
  onGenerate(): void;
}

export const VoiceSpeedControls: React.FC<VoiceSpeedControlsProps> = ({
  voices,
  selectedVoiceId,
  onVoiceChange,
  speedOptions,
  speed,
  onSpeedChange,
  disableGenerate,
  isGenerating,
  onGenerate
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 dark:text-slate-400">
          Voice
        </label>
        <select
          value={selectedVoiceId}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 dark:text-slate-400">
          Speed
        </label>
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
        >
          {speedOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onGenerate}
        disabled={disableGenerate}
        className="inline-flex items-center gap-1 rounded-md bg-primary-600 text-white text-xs font-medium py-2 px-3 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isGenerating ? "Generating..." : "Generate audio"}
      </button>
    </div>
  );
};

