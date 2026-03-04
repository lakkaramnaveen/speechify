import React, { useMemo } from "react";

interface ReadingViewProps {
  text: string;
  currentTime: number;
  duration: number;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  text,
  currentTime,
  duration
}) => {
  const words = useMemo(() => {
    const tokens = (text || "").split(/\s+/).filter(Boolean);
    return tokens;
  }, [text]);

  const currentWordIndex = useMemo(() => {
    if (!duration || !words.length) return -1;
    const progress = currentTime / duration;
    const idx = Math.floor(progress * words.length);
    if (idx < 0 || idx >= words.length) return -1;
    return idx;
  }, [currentTime, duration, words.length]);

  return (
    <div className="w-1/2 flex flex-col">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
        Reading view
      </label>
      <div className="flex-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm overflow-y-auto leading-relaxed">
        {words.length === 0 ? (
          <span className="text-slate-400 text-xs">
            Generated reading view will appear here once you add text.
          </span>
        ) : (
          <p className="whitespace-pre-wrap">
            {words.map((word, idx) => {
              const isCurrent = idx === currentWordIndex;
              return (
                <span
                  key={`${word}-${idx}`}
                  className={
                    isCurrent
                      ? "bg-primary-200 dark:bg-primary-700/60 rounded px-0.5"
                      : ""
                  }
                >
                  {word}
                  {idx < words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </p>
        )}
      </div>
    </div>
  );
};

