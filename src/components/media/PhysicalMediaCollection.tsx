import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { RotateCcw } from "lucide-react";
import type { MediaMachineState } from "./useMediaMachine";
import type { MediaKind, PhysicalMedia } from "./media-catalog";
import type { createMediaPhysics } from "./media-physics";
import "./physical-media.css";

export type PhysicalCollectionProps = {
  kind: MediaKind;
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
  items,
}: PhysicalCollectionProps & { items: PhysicalMedia[] }) {
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
      .then(({ createMediaPhysics }) => {
        if (cancelled || !canvas.current) return;
        try {
          engine.current = createMediaPhysics({
            canvas: canvas.current,
            anchors: anchors.current.filter((el): el is HTMLDivElement => !!el),
            buttons: buttons.current.filter(
              (el): el is HTMLButtonElement => !!el
            ),
            items,
            kind,
            dock: () => dockRef.current,
            state: () => ({
              selected: live.current.deck.selected,
              phase: live.current.deck.phase,
              choose: live.current.deck.choose,
              insert: live.current.onInsert,
            }),
          });
          setReady(true);
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
  }, [mounted, active, catalogKey, kind, lang, dockRef]);
  return (
    <section
      className={`physical-collection collection-${kind} ${ready ? "is-ready" : ""}`}
      aria-label={pt ? "Coleção de mídias 3D" : "3D media collection"}
    >
      <button
        className="physical-reset"
        onClick={() => engine.current?.reset()}
        disabled={!ready}
        aria-label={pt ? "Repor posições" : "Reset positions"}
        title={pt ? "Repor posições" : "Reset positions"}
      >
        <RotateCcw size={12} />
      </button>
      <p className="sr-only">
        {pt
          ? "Teclado: Enter seleciona. Use Inserir na entrada abaixo. Setas movem, R gira e Esc devolve à coleção."
          : "Keyboard: Enter selects an item. Use Insert at the slot below. Arrow keys move, R rotates, Escape returns it to the collection."}
      </p>
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
              {(!ready || fallback) && (
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
      {active &&
        mounted &&
        createPortal(
          <div className="physical-world" data-kind={kind}>
            <canvas
              key={`${kind}:${lang}:${catalogKey}`}
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
                  title={item.title}
                />
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
