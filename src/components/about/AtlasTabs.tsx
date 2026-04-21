import { useState } from "react";
import type { AtlasLanguage, AtlasPlace } from "@/data/about";

type Props = {
  languages: AtlasLanguage[];
  places: AtlasPlace[];
};

export default function AtlasTabs({ languages, places }: Props) {
  const [tab, setTab] = useState<"languages" | "places">("languages");

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="flex gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
        <button
          role="tab"
          aria-selected={tab === "languages"}
          onClick={() => setTab("languages")}
          className={`rounded-md border px-2 py-1 transition-colors ${
            tab === "languages"
              ? "border-accent text-accent"
              : "border-border/60 text-muted hover:text-foreground"
          }`}
        >
          languages
        </button>
        <button
          role="tab"
          aria-selected={tab === "places"}
          onClick={() => setTab("places")}
          className={`rounded-md border px-2 py-1 transition-colors ${
            tab === "places"
              ? "border-accent text-accent"
              : "border-border/60 text-muted hover:text-foreground"
          }`}
        >
          places
        </button>
      </div>

      {tab === "languages" ? (
        <ul className="space-y-1.5">
          {languages.map(l => {
            const filled = "▓".repeat(l.level) + "░".repeat(4 - l.level);
            return (
              <li
                key={l.code}
                className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 text-sm"
              >
                <span className="font-mono text-[10px] uppercase text-muted">{l.code}</span>
                <span className="truncate">{l.name}</span>
                <span className="font-mono text-[11px] text-accent">{filled}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-1.5">
          {places.map(p => (
            <li
              key={p.code + p.city}
              className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-2 text-sm"
            >
              <span className="font-mono text-[10px] uppercase text-muted">{p.code}</span>
              <span className="truncate">
                {p.city}
                {p.note && <span className="text-muted"> — {p.note}</span>}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {p.kind}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
