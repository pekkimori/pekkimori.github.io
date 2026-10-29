import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowUpFromLine } from "lucide-react";
import { CARTRIDGES, mediaCatalog } from "./media-catalog";
import { ANIME_TAPES } from "@/data/media";
import { Tetris, Snake, Minesweeper } from "./ArcadeGames";
import YouTubePlayer from "./YouTubePlayer";
import CRTScreenEffects from "../terminal/CRTScreenEffects";
import "./physical-media.css";
import "./media.css";
import "../terminal/crt-screen.css";

export default function MediaPlayback({
  kind,
  index,
  lang,
  onClose,
  onPlay,
  pauseSignal,
}: {
  kind: "anime" | "games";
  index: number;
  lang: "en" | "pt";
  onClose: () => void;
  onPlay: () => void;
  pauseSignal: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  const pt = lang === "pt",
    item = mediaCatalog(kind, lang)[index],
    tape = ANIME_TAPES[index];
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    const focusTarget =
      dialog.current?.querySelector<HTMLElement>("[data-autofocus]");
    focusTarget?.focus();
    return () => {
      dialog.current?.close();
      previous?.focus?.({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className={`media-playback playback-${kind}`}
      aria-label={item.title}
      onCancel={event => {
        event.preventDefault();
        close.current();
      }}
    >
      <button
        className="media-button playback-eject"
        data-autofocus
        onClick={onClose}
      >
        <ArrowUpFromLine size={14} />
        {pt ? "Ejetar e voltar" : "Eject & return"}
      </button>
      <div className="playback-stage">
        {kind === "anime" ? (
          <YouTubePlayer
            videoId={tape.videoId}
            title={`${item.title} — ${item.subtitle}`}
            lang={lang}
            pauseSignal={pauseSignal}
            onState={state => {
              if (state === 1) onPlay();
            }}
          />
        ) : CARTRIDGES[index].id === "tetris" ? (
          <Tetris lang={lang} active />
        ) : CARTRIDGES[index].id === "snake" ? (
          <Snake lang={lang} active />
        ) : (
          <Minesweeper lang={lang} active />
        )}
      </div>
      <CRTScreenEffects />
    </dialog>,
    document.body
  );
}
