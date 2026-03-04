import { useEffect, useMemo, useRef, useState } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  const loadFromArrayBuffer = (buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(url);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const play = () => {
    if (!audioRef.current || !audioUrl) return;
    audioRef.current.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const seekByPercent = (percent: number) => {
    if (!audioRef.current || !duration) return;
    const newTime = (percent / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const playbackPercent = duration ? (currentTime / duration) * 100 : 0;

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

  return {
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
  };
}

