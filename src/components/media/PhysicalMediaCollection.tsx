import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { LayoutGrid, Rows3, RotateCcw, Search, X } from "lucide-react";
import type { MediaMachineState } from "./useMediaMachine";
import type { MediaKind, PhysicalMedia } from "./media-catalog";
import type { createMediaPhysics } from "./media-physics";
import { searchMedia } from "./media-catalog";
import "../bookshelf/bookshelf.css";
import "./physical-media.css";

export type PhysicalCollectionProps = {
  kind: MediaKind;
  profile?: ReactNode;
  lang: "en" | "pt";
  active: boolean;
  deck: MediaMachineState;
  dockRef: RefObject<HTMLButtonElement | null>;
  onInsert: (index: number) => void;
};
export default function PhysicalMediaCollection({
  kind,
  lang,
  active,
  deck,
  dockRef,
  onInsert,
  items: catalog,
  profile,
}: PhysicalCollectionProps & { items: PhysicalMedia[] }) {
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const matches = catalog.filter(item =>
      kind === "music"
        ? searchMedia(item, query)
        : query
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLocaleLowerCase(lang)
            .trim()
            .split(/\s+/)
            .every(term =>
              `${item.title} ${item.subtitle}`
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLocaleLowerCase(lang)
                .includes(term)
            )
    );
    return matches.sort((a, b) => a.title.localeCompare(b.title, lang));
  }, [catalog, kind, query, lang]);
  const [view, setView] = useState<"spines" | "covers">("spines");
  const [mounted, setMounted] = useState(false),
    [fallback, setFallback] = useState(false),
    [ready, setReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    anchors = useRef<(HTMLDivElement | null)[]>([]),
    buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const engine = useRef<ReturnType<typeof createMediaPhysics> | null>(null);
  const live = useRef({ deck, onInsert });
  live.current = { deck, onInsert };
  const pt = lang === "pt";
  const catalogKey = items.map(item => item.index).join(",");
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || !active || !canvas.current) return;
    let cancelled = false;
    setReady(false);
    setFallback(false);
    import("./media-physics")
      .then(async ({ createMediaPhysics }) => {
        const { prepareMediaArtwork } = await import("./media-objects");
        await prepareMediaArtwork(items);
        if (cancelled || !canvas.current) return;
        try {
          engine.current = createMediaPhysics({
            canvas: canvas.current,
            onReady: () => {
              if (!cancelled) setReady(true);
            },
            anchors: anchors.current.filter((el): el is HTMLDivElement => !!el),
            buttons: buttons.current.filter(
              (el): el is HTMLButtonElement => !!el
            ),
            items,
            kind,
            view,
            dock: () => dockRef.current,
            state: () => ({
              selected: live.current.deck.selected,
              phase: live.current.deck.phase,
              choose: live.current.deck.choose,
              insert: live.current.onInsert,
            }),
          });
        } catch {
          setFallback(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
    // Item content is fixed by kind/language; filtering changes the index key.
  }, [mounted, active, catalogKey, kind, lang, dockRef, view]);
  return (
    <section
      className={`bookshelf-archive physical-collection collection-${kind} ${ready ? "is-ready" : ""}`}
      data-view={view}
      aria-busy={!ready && !fallback}
      aria-label={pt ? "Coleção de mídias 3D" : "3D media collection"}
    >
      {!ready && !fallback && (
        <span className="sr-only" role="status">
          {pt ? "Carregando coleção…" : "Loading collection…"}
        </span>
      )}
      <div className="bookshelf-toolbar">
        <label className="bookshelf-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={query}
            aria-label={pt ? "Buscar na coleção" : "Search collection"}
            placeholder={
              kind === "music"
                ? pt
                  ? "Música, artista ou álbum…"
                  : "Song, artist, or album…"
                : pt
                  ? "Título ou tema…"
                  : "Title or theme…"
            }
            onChange={event => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={pt ? "Limpar busca" : "Clear search"}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <div
          className="bookshelf-views"
          role="group"
          aria-label={pt ? "Visualização" : "Collection view"}
        >
          <button
            type="button"
            aria-pressed={view === "spines"}
            onClick={() => setView("spines")}
          >
            <Rows3 size={13} aria-hidden="true" />
            {pt ? "Lombadas" : "Spines"}
          </button>
          <button
            type="button"
            aria-pressed={view === "covers"}
            onClick={() => setView("covers")}
          >
            <LayoutGrid size={13} aria-hidden="true" />
            {pt ? "Capas" : "Covers"}
          </button>
        </div>
      </div>
      <div className="bookshelf-controls">
        {profile}
        <button
          type="button"
          className="physical-reset"
          onClick={() => engine.current?.reset()}
          disabled={!ready}
          aria-label={pt ? "Repor posições" : "Reset positions"}
          title={pt ? "Repor posições" : "Reset positions"}
        >
          <RotateCcw size={12} />
        </button>
      </div>
      <p className="sr-only">
        {pt
          ? "Teclado: Enter seleciona. Use Inserir na entrada abaixo. Setas movem, R gira e Esc devolve à coleção."
          : "Keyboard: Enter selects an item. Use Insert at the slot below. Arrow keys move, R rotates, Escape returns it to the collection."}
      </p>
      <div className="physical-shelf-bay">
        {!items.length && (
          <p className="bookshelf-empty" role="status">
            {pt ? "Nenhum resultado encontrado." : "No matches found."}
          </p>
        )}
        <div className="physical-media-grid">
          {items.map((item, i) => (
            <div
              className={`physical-place ${deck.loaded === item.index ? "is-inserted" : ""}`}
              key={item.index}
            >
              <div
                ref={el => {
                  anchors.current[i] = el;
                }}
                className="physical-anchor"
                data-media-index={item.index}
              >
                {!fallback && (
                  <span
                    className={`physical-skeleton ${ready ? "is-hidden" : ""}`}
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                )}
                {fallback && (
                  <button
                    className="physical-fallback"
                    aria-label={`${item.title} — ${item.subtitle}`}
                    onClick={() => deck.choose(item.index)}
                  >
                    <span>
                      {kind === "anime"
                        ? "VHS"
                        : kind === "games"
                          ? "16 BIT"
                          : "VINYL"}
                    </span>
                    <strong>{item.title}</strong>
                  </button>
                )}
              </div>
              <div className="physical-caption">
                <span>{String(item.index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="shelf-baseline" aria-hidden="true" />
      </div>
      {active &&
        mounted &&
        createPortal(
          <div
            className={`physical-world ${ready ? "is-ready" : ""}`}
            data-kind={kind}
            data-view={view}
          >
            <canvas
              key={`${kind}:${lang}:${catalogKey}:${view}`}
              ref={canvas}
              aria-hidden="true"
              className="physical-canvas"
            />
            {!fallback &&
              items.map((item, i) => (
                <button
                  key={item.index}
                  ref={el => {
                    buttons.current[i] = el;
                  }}
                  className="physical-hit"
                  aria-label={`${item.title} — ${item.subtitle}`}
                  aria-describedby={`physical-keyboard-${kind}`}
                  style={{ visibility: "hidden" }}
                  title={`${item.title} — ${item.subtitle}`}
                ></button>
              ))}
            <span id={`physical-keyboard-${kind}`} className="sr-only">
              {pt
                ? "Enter para selecionar, setas para mover, R para girar. Insira na entrada abaixo da tela."
                : "Enter to select, arrows to move, R to turn. Insert in the slot beneath the screen."}
            </span>
          </div>,
          document.body
        )}
    </section>
  );
}
