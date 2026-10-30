import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from "@/data/achievements";
import {
  ACHIEVEMENT_EVENT,
  ACHIEVEMENT_STORAGE_KEY,
  readAchievements,
  type AchievementArrival,
  type UnlockedAchievements,
} from "@/utils/achievements";
import { RIDDLE_STORAGE_KEY } from "@/utils/riddles";
import type { createTrinketScene } from "./trinket-scene";
import "./achievements.css";

type Props = {
  lang: "en" | "pt";
  active: boolean;
  arrival: AchievementArrival | null;
};
export default function AchievementsShelf({ lang, active, arrival }: Props) {
  const pt = lang === "pt";
  const [unlocked, setUnlocked] = useState<UnlockedAchievements>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false),
    [fallback, setFallback] = useState(false);
  const [landing, setLanding] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null),
    panel = useRef<HTMLDivElement>(null);
  const anchors = useRef(new Map<string, HTMLElement>());
  const engine = useRef<ReturnType<typeof createTrinketScene> | null>(null);
  const consumed = useRef<string | null>(null);
  const arrivalKey = arrival ? `${arrival.id}:${arrival.foundAt}` : null;
  const drag = useRef<{ id: string; x: number; pointer: number } | null>(null);
  const unlockedKey = Object.keys(unlocked).sort().join(",");
  useEffect(() => {
    const refresh = () => {
      const preview =
        new URLSearchParams(window.location.search).get("preview") === "all";
      setUnlocked(
        preview
          ? Object.fromEntries(ACHIEVEMENTS.map(item => [item.id, 1]))
          : readAchievements()
      );
    };
    const storage = (event: StorageEvent) => {
      if (
        !event.key ||
        [ACHIEVEMENT_STORAGE_KEY, RIDDLE_STORAGE_KEY].includes(event.key)
      )
        refresh();
    };
    refresh();
    window.addEventListener(ACHIEVEMENT_EVENT, refresh);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(ACHIEVEMENT_EVENT, refresh);
      window.removeEventListener("storage", storage);
    };
  }, []);
  useEffect(() => {
    if (!active || !canvas.current || !panel.current) return;
    let cancelled = false;
    setReady(false);
    setFallback(false);
    setLanding(null);
    // Scroll the destination into view before measuring its shelf position.
    if (
      arrival &&
      Object.hasOwn(unlocked, arrival.id) &&
      consumed.current !== arrivalKey
    )
      anchors.current
        .get(arrival.id)
        ?.scrollIntoView({ block: "center", behavior: "instant" });
    import("./trinket-scene")
      .then(({ createTrinketScene }) => {
        if (cancelled || !canvas.current || !panel.current) return;
        try {
          engine.current = createTrinketScene({
            canvas: canvas.current,
            panel: panel.current,
            items: ACHIEVEMENTS.filter(item =>
              Object.hasOwn(unlocked, item.id)
            ),
            anchors: anchors.current,
          });
          setReady(true);
          if (
            arrival &&
            Object.hasOwn(unlocked, arrival.id) &&
            consumed.current !== arrivalKey
          ) {
            setSelected(arrival.id);
            setLanding(arrival.id);
            if (
              engine.current.arrive(arrival.id, () => {
                if (!cancelled) setLanding(null);
              })
            )
              consumed.current = arrivalKey;
          }
        } catch {
          setFallback(true);
          setLanding(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFallback(true);
          setLanding(null);
        }
      });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
    // Unlock dates do not affect the geometry; the set of objects does.
  }, [active, unlockedKey, arrival?.id, arrival?.foundAt]);
  useEffect(() => {
    engine.current?.select(selected);
  }, [selected, ready]);
  const count = Object.keys(unlocked).length;
  const item = ACHIEVEMENTS.find(
    item => item.id === selected && Object.hasOwn(unlocked, item.id)
  );
  return (
    <div
      ref={panel}
      className={`keepsakes ${ready ? "is-ready" : ""} ${fallback ? "has-fallback" : ""}`}
      data-arriving={landing ?? undefined}
    >
      {landing && (
        <span className="sr-only" role="status">
          {pt
            ? "Uma nova descoberta encontrou seu lugar."
            : "A new discovery is finding its place."}
        </span>
      )}
      {ACHIEVEMENT_GROUPS.map(group => {
        const objects = ACHIEVEMENTS.filter(item => item.group === group.id);
        const found = objects.filter(item =>
          Object.hasOwn(unlocked, item.id)
        ).length;
        return (
          <section
            className="keepsake-section"
            key={group.id}
            aria-label={group[lang]}
          >
            <div className="keepsake-section-label">
              <h3>
                <span>{group.mark}</span> {group[lang]}
              </h3>
              <span>
                {found} / {objects.length}
              </span>
            </div>
            <div className="keepsake-shelves">
              {objects.map((object, index) => {
                const discovered = Object.hasOwn(unlocked, object.id);
                return (
                  <div
                    key={object.id}
                    className={`keepsake-place ${discovered ? "is-found" : "is-empty"} ${selected === object.id ? "is-selected" : ""}`}
                  >
                    <div
                      className="keepsake-anchor"
                      ref={element => {
                        if (element) anchors.current.set(object.id, element);
                        else anchors.current.delete(object.id);
                      }}
                    >
                      {discovered && (
                        <button
                          className="keepsake-object"
                          aria-label={object.title[lang]}
                          title={object.description[lang]}
                          aria-pressed={selected === object.id}
                          onClick={() => setSelected(object.id)}
                          onPointerDown={event => {
                            if (event.button !== 0) return;
                            event.currentTarget.setPointerCapture(
                              event.pointerId
                            );
                            drag.current = {
                              id: object.id,
                              x: event.clientX,
                              pointer: event.pointerId,
                            };
                            setSelected(object.id);
                          }}
                          onPointerMove={event => {
                            if (
                              drag.current?.id !== object.id ||
                              drag.current.pointer !== event.pointerId
                            )
                              return;
                            engine.current?.turn(
                              object.id,
                              (event.clientX - drag.current.x) * 0.025
                            );
                            drag.current.x = event.clientX;
                          }}
                          onPointerUp={() => {
                            drag.current = null;
                          }}
                          onPointerCancel={() => {
                            drag.current = null;
                          }}
                          onKeyDown={event => {
                            if (
                              event.key === "ArrowLeft" ||
                              event.key === "ArrowRight"
                            ) {
                              event.preventDefault();
                              engine.current?.turn(
                                object.id,
                                event.key === "ArrowLeft" ? -0.35 : 0.35
                              );
                            }
                          }}
                        >
                          {(!ready || fallback) && (
                            <span
                              className="keepsake-fallback"
                              aria-hidden="true"
                            >
                              {object.title[lang].slice(0, 2)}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="keepsake-plaque">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{discovered ? object.title[lang] : "???"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {(item || count === ACHIEVEMENTS.length) && (
        <footer className="keepsake-memory" aria-live="polite">
          <div>
            <h3>
              {item
                ? item.title[lang]
                : pt
                  ? "Um pequeno universo, reunido."
                  : "A little universe, collected."}
            </h3>
            {(item || count === ACHIEVEMENTS.length) && (
              <p>
                {item
                  ? item.description[lang]
                  : pt
                    ? "Você encontrou todos os 36 objetos. Cada um guarda uma história."
                    : "You found all 36 keepsakes. Every one holds a story."}
              </p>
            )}
          </div>
        </footer>
      )}
      {active &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="keepsake-world" aria-hidden="true">
            <canvas
              key={`${unlockedKey}:${arrival?.foundAt ?? 0}`}
              ref={canvas}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
