import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
  Volume2,
} from "lucide-react";
import { FAVORITE_SONGS } from "@/data/about";
import { RECORDS, RECORD_PREVIEWS } from "@/data/media";
import YouTubePlayer, { type VideoHandle } from "./YouTubePlayer";
import { tones, type Lang } from "./MediaShelf";
import type { CSSProperties } from "react";
export default function MusicPlayer({
  lang,
  selected,
  onSelect,
  onClose,
  onOpenLibrary,
  pauseSignal,
  onPlay,
}: {
  lang: Lang;
  selected: number;
  onSelect: (i: number) => void;
  onClose: () => void;
  onOpenLibrary: () => void;
  pauseSignal: number;
  onPlay: () => void;
}) {
  const pt = lang === "pt",
    song = FAVORITE_SONGS[selected],
    record = RECORDS[selected];
  const player = useRef<VideoHandle | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  const preview = previewFor === record.videoId;
  const previewTrack = RECORD_PREVIEWS[selected];
  const [expanded, setExpanded] = useState(true),
    [state, setState] = useState(-1),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(65);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const lastPause = useRef(pauseSignal);
  useEffect(() => {
    if (lastPause.current !== pauseSignal) {
      player.current?.pauseVideo();
      audio.current?.pause();
      lastPause.current = pauseSignal;
    }
  }, [pauseSignal]);
  useEffect(() => {
    setTime(0);
    setDuration(0);
    setState(-1);
    setAudioError(false);
  }, [selected]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (preview && audio.current) {
        setTime(audio.current.currentTime || 0);
        setDuration(
          Number.isFinite(audio.current.duration) ? audio.current.duration : 0
        );
      } else if (player.current?.getCurrentTime) {
        setTime(player.current.getCurrentTime() || 0);
        setDuration(player.current.getDuration() || 0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [preview]);
  const next = (step: number) =>
    onSelect((selected + step + FAVORITE_SONGS.length) % FAVORITE_SONGS.length);
  const clock = (n: number) =>
    `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
  const playing = state === 1;
  return (
    <aside
      className={`music-player ${expanded ? "is-expanded" : ""}`}
      aria-label={pt ? "Reprodutor de CD" : "CD player"}
      style={
        { "--media-tone": tones[selected % tones.length] } as CSSProperties
      }
    >
      <div className="music-player-top">
        <span>
          <i className={`status-light ${playing ? "is-on" : ""}`} />
          {pt ? "TOCANDO NO SEU CANTO" : "SOUNDTRACK TO YOUR CORNER"}
        </span>
        <button
          onClick={() => setExpanded(v => !v)}
          aria-label={
            expanded
              ? pt
                ? "Recolher player"
                : "Collapse player"
              : pt
                ? "Expandir player"
                : "Expand player"
          }
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          onClick={onClose}
          aria-label={pt ? "Parar e ejetar disco" : "Stop and eject disc"}
        >
          <X size={14} />
        </button>
      </div>
      <div className="music-player-video" hidden={!expanded}>
        {preview ? (
          <div className="music-preview">
            <span
              className={`preview-vinyl ${playing ? "is-spinning" : ""}`}
              aria-hidden="true"
            >
              <i />
            </span>
            <strong>
              {pt ? "Prévia do Apple Music" : "Apple Music preview"}
            </strong>
            <span role="status">
              {audioError
                ? pt
                  ? "Prévia indisponível. Abra a música pelo link abaixo."
                  : "Preview unavailable. Open the song using the link below."
                : pt
                  ? "Faixa completa indisponível neste player."
                  : "Full track unavailable in this player."}
            </span>
            <a
              href={previewTrack.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {pt
                ? "Música completa no Apple Music"
                : "Full song on Apple Music"}{" "}
              ↗
            </a>
            <audio
              key={previewTrack.src}
              ref={audio}
              src={previewTrack.src}
              autoPlay
              preload="metadata"
              onLoadedMetadata={() => {
                if (audio.current) {
                  audio.current.volume = volumeRef.current / 100;
                  setDuration(audio.current.duration);
                }
              }}
              onPlay={() => {
                setState(1);
                onPlay();
              }}
              onPause={() => setState(2)}
              onEnded={() => setState(0)}
              onError={() => {
                setAudioError(true);
                setState(2);
              }}
            />
          </div>
        ) : (
          <YouTubePlayer
            videoId={record.videoId}
            title={`${song.title} — ${song.artist}`}
            lang={lang}
            onReady={p => {
              player.current = p;
              p?.setVolume(volumeRef.current);
            }}
            onState={value => {
              setState(value);
              if (value === 1) onPlay();
            }}
            onEnded={() => setState(0)}
            onError={() => setPreviewFor(record.videoId)}
          />
        )}
      </div>
      <div className="music-player-main">
        <button
          className={`mini-record ${playing ? "is-spinning" : ""}`}
          onClick={onOpenLibrary}
          aria-label={pt ? "Abrir coleção de discos" : "Open disc collection"}
        >
          <span />
        </button>
        <button className="music-now-playing" onClick={onOpenLibrary}>
          <strong>{song.title}</strong>
          <small>
            {song.artist}
            {preview ? (pt ? " · prévia" : " · preview") : ""}
          </small>
        </button>
        <button
          className="music-toggle"
          aria-label={
            playing
              ? pt
                ? "Pausar música"
                : "Pause music"
              : pt
                ? "Reproduzir música"
                : "Play music"
          }
          onClick={() => {
            if (preview && audio.current) {
              if (playing) audio.current.pause();
              else void audio.current.play().catch(() => setState(2));
            } else if (playing) player.current?.pauseVideo();
            else player.current?.playVideo();
          }}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      <div className="music-player-transport">
        <button
          onClick={() => next(-1)}
          aria-label={pt ? "Disco anterior" : "Previous disc"}
        >
          <SkipBack size={14} />
        </button>
        <span>{clock(time)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={1}
          value={Math.min(time, duration || 1)}
          disabled={!duration}
          onChange={e => {
            const t = Number(e.target.value);
            setTime(t);
            if (preview && audio.current) audio.current.currentTime = t;
            else player.current?.seekTo(t, true);
          }}
          aria-label={pt ? "Posição da música" : "Song position"}
        />
        <span>{clock(duration)}</span>
        <button
          onClick={() => next(1)}
          aria-label={pt ? "Próximo disco" : "Next disc"}
        >
          <SkipForward size={14} />
        </button>
      </div>
      {expanded && (
        <div className="music-player-detail">
          <span>
            {record.album} / {record.year}
          </span>
          <label>
            <Volume2 size={12} />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => {
                const value = Number(e.target.value);
                setVolume(value);
                player.current?.setVolume(value);
                if (audio.current) audio.current.volume = value / 100;
              }}
              aria-label={pt ? "Volume" : "Volume"}
            />
          </label>
        </div>
      )}
    </aside>
  );
}
