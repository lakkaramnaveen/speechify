import React, { useEffect, useMemo, useRef, useState } from "react";

type VoiceOption = {
  id: string;
  label: string;
};

type DocumentItem = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
};

const VOICES: VoiceOption[] = [
  { id: "alloy", label: "Alloy (Neutral)" },
  { id: "verse", label: "Verse (Male-like)" },
  { id: "ash", label: "Ash (Female-like)" }
];

const SPEEDS = [
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1.0x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" }
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [editorText, setEditorText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voiceId, setVoiceId] = useState<string>(VOICES[0].id);
  const [speed, setSpeed] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const words = useMemo(() => {
    const text = editorText || "";
    const tokens = text.split(/\s+/).filter(Boolean);
    return tokens;
  }, [editorText]);

  const currentWordIndex = useMemo(() => {
    if (!duration || !words.length) return -1;
    const progress = currentTime / duration;
    const idx = Math.floor(progress * words.length);
    if (idx < 0 || idx >= words.length) return -1;
    return idx;
  }, [currentTime, duration, words.length]);

  const addDocumentFromText = (name: string, text: string) => {
    const doc: DocumentItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      text,
      createdAt: Date.now()
    };
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocId(doc.id);
    setEditorText(text);
  };

  const handleNewBlankDoc = () => {
    addDocumentFromText("Untitled text", "");
  };

  const handleDocumentClick = (doc: DocumentItem) => {
    setActiveDocId(doc.id);
    setEditorText(doc.text);
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to extract text");
      }

      const data = await res.json();
      addDocumentFromText(file.name, data.text || "");
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to process the uploaded file."
      );
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleGenerateAudio = async () => {
    if (!editorText.trim()) {
      setError("Please enter or load some text first.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: editorText,
          voice: voiceId,
          speed
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate speech.");
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "An error occurred generating speech."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.play().then(
      () => {
        setIsPlaying(true);
      },
      (err) => {
        console.error(err);
        setError("Unable to start audio playback.");
      }
    );
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current || !duration) return;
    const newTime = (value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "speechifyclone.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formattedCurrentTime = useMemo(() => {
    const totalSeconds = Math.floor(currentTime);
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [currentTime]);

  const formattedDuration = useMemo(() => {
    const totalSeconds = Math.floor(duration || 0);
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [duration]);

  const playbackPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex h-full">
        <aside className="w-72 border-r border-slate-200 bg-white/80 backdrop-blur dark:bg-slate-900/60 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                SpeechifyClone
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Your AI reader
              </div>
            </div>
            <button
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>

          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={handleNewBlankDoc}
              className="flex-1 rounded-md bg-primary-600 text-white text-xs font-medium py-2 px-3 hover:bg-primary-700 transition"
            >
              New text
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Upload file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="px-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Documents
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {documents.length === 0 && (
              <div className="text-xs text-slate-400 px-2 py-2">
                No documents yet. Create a new text or upload a file.
              </div>
            )}
            {documents.map((doc) => {
              const active = doc.id === activeDocId;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs transition border ${
                    active
                      ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-600/20 dark:border-primary-500 dark:text-primary-100"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-medium truncate">{doc.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {doc.text.slice(0, 80) || "Empty"}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between bg-white/90 dark:bg-slate-900/80 backdrop-blur">
            <div className="flex flex-col">
              <h1 className="text-base font-semibold">Reader</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste text or upload a document to start listening.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Voice
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                >
                  {VOICES.map((v) => (
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
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
                >
                  {SPEEDS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateAudio}
                disabled={isGenerating || !editorText.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-primary-600 text-white text-xs font-medium py-2 px-3 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isGenerating ? "Generating..." : "Generate audio"}
              </button>
            </div>
          </header>

          {error && (
            <div className="px-6 pt-3">
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-xs px-3 py-2 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <section className="flex-1 px-6 py-4 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 min-h-0 flex gap-4">
              <div className="w-1/2 flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Text input
                </label>
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="Paste your book, article, or notes here..."
                  className="flex-1 w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/70"
                />
              </div>

              <div className="w-1/2 flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Reading view
                </label>
                <div className="flex-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm overflow-y-auto leading-relaxed">
                  {words.length === 0 ? (
                    <span className="text-slate-400 text-xs">
                      Generated reading view will appear here once you add
                      text.
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
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlay}
                    disabled={!audioUrl || isPlaying}
                    className="rounded-full bg-primary-600 text-white text-xs font-semibold px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary-700 transition"
                  >
                    Play
                  </button>
                  <button
                    onClick={handlePause}
                    disabled={!audioUrl || !isPlaying}
                    className="rounded-full border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Pause
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={!audioUrl}
                    className="rounded-full border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Stop
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!audioUrl}
                    className="ml-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs px-3 py-2 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Download MP3
                  </button>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 w-10 text-right">
                    {formattedCurrentTime}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.5}
                    value={playbackPercent}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    disabled={!audioUrl || !duration}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 w-10">
                    {formattedDuration}
                  </span>
                </div>
              </div>
              <audio ref={audioRef} src={audioUrl ?? undefined} className="hidden" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;

