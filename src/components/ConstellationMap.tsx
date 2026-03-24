import { useState } from "react";

interface Project {
  title: string;
  description: string;
  highlights?: string[];
  tags?: string[];
  link?: string;
  github?: string;
  status?: "live" | "wip";
  icon?: string;
  previewColor?: string;
  category?: string;
  pos: [number, number];
  magnitude?: number;
}

const PROJECTS: Project[] = [
  {
    title: "??",
    description: "??",
    highlights: ["??", "??", "??"],
    tags: ["??"],
    status: "live",
    icon: "??",
    previewColor: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    category: "??",
    pos: [28, 18],
    magnitude: 2.2,
  },
  {
    title: "??",
    description: "??",
    highlights: ["??", "??", "??"],
    tags: ["??"],
    status: "live",
    icon: "??",
    previewColor: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
    category: "??",
    pos: [72, 24],
    magnitude: 1.8,
  },
  {
    title: "??",
    description: "??",
    highlights: ["??", "??", "??"],
    tags: ["??"],
    status: "wip",
    icon: "??",
    previewColor: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
    category: "??",
    pos: [82, 58],
    magnitude: 1.6,
  },
  {
    title: "??",
    description: "??",
    highlights: ["??", "??", "??"],
    tags: ["??"],
    status: "wip",
    icon: "??",
    previewColor: "linear-gradient(135deg, #7c3aed 0%, #a21caf 100%)",
    category: "??",
    pos: [18, 52],
    magnitude: 1.7,
  },
  {
    title: "??",
    description: "??",
    highlights: ["??", "??", "??"],
    tags: ["??"],
    status: "wip",
    icon: "??",
    previewColor: "linear-gradient(135deg, #be123c 0%, #c2410c 100%)",
    category: "??",
    pos: [38, 74],
    magnitude: 1.5,
  },
  {
    title: "??",
    description: "??",
    highlights: ["??", "??", "??"],
    tags: ["??"],
    status: "wip",
    icon: "??",
    previewColor: "linear-gradient(135deg, #d97706 0%, #ca8a04 100%)",
    category: "??",
    pos: [60, 68],
    magnitude: 1.6,
  },
];

const LINES: [number, number][] = [
  [0, 1], // Minerva — Blog
  [0, 3], // Minerva — MoodOS
  [1, 2], // Blog — Neru-box
  [3, 4], // MoodOS — Pixel Dungeon
  [4, 5], // Pixel Dungeon — Lantern
  [5, 2], // Lantern — Neru-box
  [1, 5], // Blog — Lantern
  [0, 4], // Minerva — Pixel Dungeon
];

// 5-pointed star clip-path
const STAR_CLIP =
  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";

// Tiny seeded PRNG for background stars
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const BG_STARS = Array.from({ length: 40 }, (_, i) => {
  const r = lcg(i * 6271 + 99991);
  return { cx: r() * 92 + 4, cy: r() * 84 + 8, r: r() * 1.1 + 0.3, o: r() * 0.18 + 0.06 };
});

export default function ConstellationMap() {
  const [selected, setSelected] = useState<number | null>(null);
  const project = selected !== null ? PROJECTS[selected] : null;

  function isConnected(a: number, b: number) {
    return selected === a || selected === b;
  }

  return (
    <div className="w-full">
      {/* Star field */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-border"
        style={{ height: "clamp(380px, 58vh, 580px)" }}
      >
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Background star field */}
          {BG_STARS.map((s, i) => (
            <circle
              key={i}
              cx={`${s.cx}%`}
              cy={`${s.cy}%`}
              r={s.r}
              style={{ fill: "var(--muted)", opacity: s.o }}
            />
          ))}

          {/* Constellation lines */}
          {LINES.map(([a, b]) => {
            const active = isConnected(a, b);
            return (
              <line
                key={`${a}-${b}`}
                x1={`${PROJECTS[a].pos[0]}%`}
                y1={`${PROJECTS[a].pos[1]}%`}
                x2={`${PROJECTS[b].pos[0]}%`}
                y2={`${PROJECTS[b].pos[1]}%`}
                style={{
                  stroke: active ? "var(--accent)" : "var(--muted)",
                  strokeWidth: active ? 1.2 : 0.6,
                  strokeOpacity: active ? 0.65 : 0.3,
                  strokeDasharray: active ? "none" : "4 7",
                  transition: "stroke 0.3s ease, stroke-opacity 0.3s ease, stroke-width 0.3s ease",
                }}
              />
            );
          })}
        </svg>

        {/* Project stars */}
        {PROJECTS.map((p, i) => {
          const isSelected = selected === i;
          const size = (p.magnitude ?? 1.5) * 9;
          const hitArea = Math.max(size * 3.5, 48);

          return (
            <button
              key={p.title}
              className="absolute"
              style={{
                left: `${p.pos[0]}%`,
                top: `${p.pos[1]}%`,
                width: hitArea,
                height: hitArea,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setSelected(isSelected ? null : i)}
              title={p.title}
            >
              {/* Glow halo when selected */}
              {isSelected && (
                <div
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: size * 2.2,
                    height: size * 2.2,
                    background: "var(--accent)",
                    opacity: 0.25,
                  }}
                />
              )}

              {/* Star */}
              <div
                style={{
                  width: isSelected ? size * 1.5 : size,
                  height: isSelected ? size * 1.5 : size,
                  clipPath: STAR_CLIP,
                  background: "var(--accent)",
                  filter: `drop-shadow(0 0 ${isSelected ? size * 0.7 : size * 0.35}px var(--accent))`,
                  transition: "width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.25s ease",
                  animation: `twinkle ${2.6 + i * 0.38}s ease-in-out ${i * 0.42}s infinite`,
                  flexShrink: 0,
                }}
              />

              {/* Label */}
              <span
                className="absolute whitespace-nowrap pointer-events-none"
                style={{
                  top: `calc(50% + ${size * 0.85}px)`,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "8px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  opacity: isSelected ? 0 : 0.6,
                  transition: "opacity 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                {p.title}
              </span>
            </button>
          );
        })}

        {/* Hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none select-none whitespace-nowrap"
          style={{
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            opacity: selected === null ? 0.45 : 0,
            transition: "opacity 0.3s ease",
            fontFamily: "inherit",
          }}
        >
          hover a star · click to open
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.75; transform: scale(1); }
            50%       { opacity: 1;    transform: scale(1.2); }
          }
        `}</style>
      </div>

      {/* Detail panel — slides in below */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: project ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          {project && (
            <DetailPanel project={project} onClose={() => setSelected(null)} />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-xl border border-border"
      style={{ animation: "fadeInUp 0.22s ease both" }}
    >
      {/* Gradient header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: project.previewColor }}
      >
        <span className="text-3xl drop-shadow-md">{project.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold leading-tight text-white/95">
            {project.title}
          </div>
          {project.category && (
            <div className="mt-0.5 text-[10px] text-white/55">{project.category}</div>
          )}
        </div>
        <StatusBadge status={project.status ?? "wip"} />
        <div className="ml-2 flex items-center gap-2">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 transition-colors hover:text-white"
              title="Visit site"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 transition-colors hover:text-white"
              title="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          )}
          <button
            onClick={onClose}
            className="ml-1 text-white/50 transition-colors hover:text-white"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 px-4 py-4">
        <p className="text-xs leading-relaxed text-muted">{project.description}</p>

        {project.highlights && project.highlights.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-border pt-3">
            {project.highlights.map(h => (
              <li key={h} className="flex items-start gap-2 text-xs text-muted">
                <span className="mt-0.5 shrink-0 text-accent">▸</span>
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 border-t border-border pt-3">
            {project.tags.map(tag => (
              <span
                key={tag}
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }: { status: "live" | "wip" }) {
  if (status === "live") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-xs text-green-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
        </span>
        live
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-0.5 text-xs text-yellow-400">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/60" />
      wip
    </span>
  );
}
