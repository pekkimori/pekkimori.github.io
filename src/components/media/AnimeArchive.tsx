import { useRef, useState } from "react";
import { ArrowUpFromLine as Eject, Play } from "lucide-react";
import { ANIME, MAL_URL } from "@/data/about";
import { ANIME_PT } from "@/data/about-pt";
import { ANIME_TAPES } from "@/data/media";
import { MediaObject, type Lang } from "./MediaShelf";
import YouTubePlayer from "./YouTubePlayer";

export default function AnimeArchive({
  lang,
  active,
  onPlay,
  pauseSignal,
}: {
  lang: Lang;
  active: boolean;
  onPlay: () => void;
  pauseSignal: number;
}) {
  const pt = lang === "pt",
    anime = pt ? ANIME_PT : ANIME;
  const [selected, setSelected] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const tape = selected === null ? null : ANIME_TAPES[selected];
  const item = selected === null ? null : anime[selected];
  return (
    <div className="media-archive anime-archive">
      <div className="anime-profile">
        <a
          className="media-profile"
          href={MAL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          MyAnimeList ↗
        </a>
      </div>
      <div className="media-shelf tape-shelf">
        {anime.map((a, i) => (
          <MediaObject
            key={a.title}
            kind="tape"
            title={a.title}
            subtitle={pt ? ANIME_TAPES[i].scenePt : ANIME_TAPES[i].scene}
            index={i}
            showCaption={false}
            selected={selected === i}
            onClick={() => {
              setSelected(i);
              setPlaying(false);
              requestAnimationFrame(() =>
                deckRef.current?.scrollIntoView({
                  block: "start",
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches
                    ? "instant"
                    : "smooth",
                })
              );
            }}
          />
        ))}
      </div>
      <div className="media-deck vhs-deck" ref={deckRef}>
        <div className="deck-topline">
          <span>
            <i
              className={
                playing && active ? "status-light is-on" : "status-light"
              }
            />
            {pt ? "REPRODUTOR VHS" : "VHS PLAYER"}
          </span>
          <span>{tape ? "SP / STEREO" : "NO TAPE"}</span>
        </div>
        <div className="vhs-screen">
          {tape && item && playing ? (
            <YouTubePlayer
              videoId={tape.videoId}
              paused={!active}
              pauseSignal={pauseSignal}
              title={`${item.title} — ${pt ? tape.scenePt : tape.scene}`}
              lang={lang}
              onState={state => {
                if (state === 1) onPlay();
              }}
            />
          ) : (
            <div className="deck-idle">
              <span className="deck-crosshair" aria-hidden="true">
                {tape ? "▷" : "＋"}
              </span>
              <strong>
                {item?.title ??
                  (pt ? "Nenhuma fita inserida" : "No tape inserted")}
              </strong>
              <p>
                {tape
                  ? pt
                    ? tape.scenePt
                    : tape.scene
                  : pt
                    ? "Escolha uma história na estante acima."
                    : "Choose a story from the shelf above."}
              </p>
              {tape && (
                <button
                  className="media-button"
                  onClick={() => {
                    onPlay();
                    setPlaying(true);
                  }}
                >
                  <Play size={14} />
                  {pt ? "Reproduzir cena" : "Play scene"}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="deck-bottomline">
          <span>{tape?.episode ?? "— — : — —"}</span>
          {tape && (
            <>
              <a
                href={`https://www.youtube.com/watch?v=${tape.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pt ? "Abrir no YouTube" : "Open on YouTube"} ↗
              </a>
              <button
                className="media-button"
                onClick={() => {
                  setSelected(null);
                  setPlaying(false);
                  requestAnimationFrame(() =>
                    deckRef.current?.scrollIntoView({
                      block: "start",
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                      ).matches
                        ? "instant"
                        : "smooth",
                    })
                  );
                }}
              >
                <Eject size={12} />
                {pt ? "Ejetar" : "Eject"}
              </button>
            </>
          )}
        </div>
      </div>
      {item && tape && (
        <section className="anime-notes" key={item.title}>
          <div className="media-eyebrow">
            {pt ? "ANOTAÇÕES NA CAPA" : "NOTES ON THE SLEEVE"}
            <span>{pt ? "Contém spoilers" : "Contains spoilers"}</span>
          </div>
          <h3>{item.title}</h3>
          {[item.tagline].flat().map((quote, i) => (
            <blockquote
              key={quote}
              className={i === tape.quote ? "is-scene-quote" : ""}
            >
              <span className="quote-index">
                {String(i + 1).padStart(2, "0")}
                {i === tape.quote && (
                  <Play
                    size={10}
                    aria-label={pt ? "Citação da cena" : "Scene quote"}
                  />
                )}
              </span>
              <p>{quote}</p>
            </blockquote>
          ))}
        </section>
      )}
    </div>
  );
}
