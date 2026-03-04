import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ThemeToggle } from "./components/layout/ThemeToggle";
import { TextEditor } from "./components/reader/TextEditor";
import { ReadingView } from "./components/reader/ReadingView";
import { PlayerControls } from "./components/reader/PlayerControls";
import { VoiceSpeedControls } from "./components/reader/VoiceSpeedControls";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { extractTextFromFile } from "./api/documentApi";
import { generateSpeech } from "./api/ttsApi";
import type { DocumentItem, DocumentId } from "./types/documents";
import type { VoiceOption } from "./types/tts";

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
  const [activeDocId, setActiveDocId] = useState<DocumentId | null>(null);
  const [editorText, setEditorText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceId, setVoiceId] = useState<string>(VOICES[0].id);
  const [speed, setSpeed] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const {
    audioRef,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    playbackPercent,
    formattedCurrentTime,
    formattedDuration,
    loadFromArrayBuffer,
    play,
    pause,
    stop,
    seekByPercent
  } = useAudioPlayer();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

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

  const handleSelectDocument = (id: DocumentId) => {
    const selected = documents.find((doc) => doc.id === id);
    if (!selected) return;
    setActiveDocId(selected.id);
    setEditorText(selected.text);
  };

  const handleFileSelected = async (file: File) => {
    setError(null);
    try {
      const text = await extractTextFromFile(file);
      addDocumentFromText(file.name, text);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to process the uploaded file."
      );
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
      const arrayBuffer = await generateSpeech({
        text: editorText,
        voice: voiceId,
        speed
      });
      loadFromArrayBuffer(arrayBuffer);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(
        e instanceof Error ? e.message : "An error occurred generating speech."
      );
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <div className="h-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex h-full">
        <Sidebar
          documents={documents}
          activeId={activeDocId}
          onSelectDocument={handleSelectDocument}
          onCreateBlank={handleNewBlankDoc}
          onFileSelected={handleFileSelected}
          themeSwitcher={
            <ThemeToggle
              theme={theme}
              onToggle={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
            />
          }
        />

        <main className="flex-1 flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between bg-white/90 dark:bg-slate-900/80 backdrop-blur">
            <div className="flex flex-col">
              <h1 className="text-base font-semibold">Reader</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste text or upload a document to start listening.
              </p>
            </div>
            <VoiceSpeedControls
              voices={VOICES}
              selectedVoiceId={voiceId}
              onVoiceChange={setVoiceId}
              speedOptions={SPEEDS}
              speed={speed}
              onSpeedChange={setSpeed}
              disableGenerate={isGenerating || !editorText.trim()}
              isGenerating={isGenerating}
              onGenerate={handleGenerateAudio}
            />
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
              <TextEditor value={editorText} onChange={setEditorText} />
              <ReadingView
                text={editorText}
                currentTime={currentTime}
                duration={duration}
              />
            </div>

            <PlayerControls
              hasAudio={Boolean(audioUrl)}
              isPlaying={isPlaying}
              playbackPercent={playbackPercent}
              currentTimeLabel={formattedCurrentTime}
              durationLabel={formattedDuration}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onSeek={seekByPercent}
              onDownload={handleDownload}
            />
            <audio ref={audioRef} src={audioUrl ?? undefined} className="hidden" />
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;

