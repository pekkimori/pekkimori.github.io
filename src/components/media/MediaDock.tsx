import type { RefObject } from "react";
import type { MediaKind } from "./media-catalog";
import { mediaCatalog } from "./media-catalog";
import type { MediaMachineState } from "./useMediaMachine";
import "./physical-media.css";

export default function MediaDock({
  kind,
  lang,
  deck,
  dockRef,
  onInsert,
  onEject,
}: {
  kind: MediaKind;
  lang: "en" | "pt";
  deck: MediaMachineState;
  dockRef: RefObject<HTMLButtonElement | null>;
  onInsert: (index: number) => void;
  onEject: () => void;
}) {
  const pt = lang === "pt";
  const item =
    deck.selected === null ? null : mediaCatalog(kind, lang)[deck.selected];
  const noun =
    kind === "anime"
      ? pt
        ? "fita VHS"
        : "VHS tape"
      : kind === "games"
        ? pt
          ? "cartucho"
          : "cartridge"
        : pt
          ? "disco"
          : "disc";
  const loaded = deck.phase === "loaded",
    inserting = deck.phase === "inserting";
  return (
    <div
      className={`screen-media-dock dock-${kind} ${loaded ? "is-loaded" : ""} ${inserting ? "is-inserting" : ""}`}
    >
      <button
        ref={dockRef}
        className="screen-media-slot"
        data-over="false"
        aria-label={
          loaded || inserting
            ? pt
              ? "Ejetar mídia"
              : "Eject media"
            : pt
              ? `Inserir ${noun}`
              : `Insert ${noun}`
        }
        aria-disabled={!item}
        onClick={() => {
          if (loaded || inserting) onEject();
          else if (item) onInsert(item.index);
        }}
      >
        <span className="slot-mouth" aria-hidden="true" />
      </button>
      <span className="sr-only" role="status">
        {inserting
          ? pt
            ? "Carregando…"
            : "Loading…"
          : loaded
            ? item?.title
            : item
              ? `${item.title} — ${item.subtitle}`
              : ""}
      </span>
    </div>
  );
}
