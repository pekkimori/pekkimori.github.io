import { useEffect, useRef, useState } from "react";

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
  [0, 1],
  [0, 3],
  [1, 2],
  [3, 4],
  [4, 5],
  [5, 2],
  [1, 5],
  [0, 4],
];

const STAR_CLIP =
  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";

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
  const [hovered, setHovered] = useState<number | null>(null);
  const [lastHovered, setLastHovered] = useState<number | null>(null);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const initRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  function isConnected(a: number, b: number) {
    return hovered === a || hovered === b;
  }

  useEffect(() => {
    if (hovered !== null) setLastHovered(hovered);
  }, [hovered]);

  useEffect(() => {
    if (hovered === null) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      initRef.current = false;
      return;
    }

    const stiffness = 0.18;
    const damping = 0.72;
    const offset = 16;

    const step = () => {
      if (!initRef.current) {
        posRef.current = { x: targetRef.current.x, y: targetRef.current.y };
        velRef.current = { x: 0, y: 0 };
        initRef.current = true;
      } else {
        velRef.current.x =
          (velRef.current.x + (targetRef.current.x - posRef.current.x) * stiffness) * damping;
        velRef.current.y =
          (velRef.current.y + (targetRef.current.y - posRef.current.y) * stiffness) * damping;
        posRef.current.x += velRef.current.x;
        posRef.current.y += velRef.current.y;
      }
      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate3d(${Math.round(posRef.current.x + offset)}px, ${Math.round(posRef.current.y + offset)}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [hovered]);

  const bubbleProject = lastHovered !== null ? PROJECTS[lastHovered] : null;

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-border"
        style={{ height: "clamp(380px, 58vh, 580px)" }}
        onMouseMove={(e) => {
          targetRef.current = { x: e.clientX, y: e.clientY };
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          aria-hidden="true"
        >
          {BG_STARS.map((s, i) => (
            <circle
              key={i}
              cx={`${s.cx}%`}
              cy={`${s.cy}%`}
              r={s.r}
              style={{ fill: "var(--muted)", opacity: s.o }}
            />
          ))}

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

        {PROJECTS.map((p, i) => {
          const isHovered = hovered === i;
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
                cursor: p.link ? "pointer" : "default",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onClick={() => {
                if (p.link) window.open(p.link, "_blank", "noopener,noreferrer");
              }}
              title={p.title}
            >
              {isHovered && (
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

              <div
                style={{
                  width: isHovered ? size * 1.5 : size,
                  height: isHovered ? size * 1.5 : size,
                  clipPath: STAR_CLIP,
                  background: "var(--accent)",
                  filter: `drop-shadow(0 0 ${isHovered ? size * 0.7 : size * 0.35}px var(--accent))`,
                  transition: "width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.25s ease",
                  animation: `twinkle ${2.6 + i * 0.38}s ease-in-out ${i * 0.42}s infinite`,
                  flexShrink: 0,
                }}
              />

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
                  opacity: isHovered ? 0 : 0.6,
                  transition: "opacity 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                {p.title}
              </span>
            </button>
          );
        })}

        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none select-none whitespace-nowrap"
          style={{
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            opacity: hovered === null ? 0.45 : 0,
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

      <div
        ref={bubbleRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          opacity: hovered !== null ? 1 : 0,
          transition: "opacity 0.18s ease",
          zIndex: 50,
          willChange: "transform, opacity",
        }}
        aria-hidden="true"
      >
        {bubbleProject && <ProjectBubble project={bubbleProject} />}
      </div>
    </div>
  );
}

function ProjectBubble({ project }: { project: Project }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
      style={{ minWidth: 180, maxWidth: 260 }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-foreground truncate">
          {project.title}
        </span>
        <span
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: project.status === "live" ? "var(--color-accent)" : "var(--color-muted)" }}
        >
          [{project.status ?? "wip"}]
        </span>
      </div>
      {project.category && (
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
          {project.category}
        </div>
      )}
      {project.description && project.description !== "??" && (
        <div className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted line-clamp-2">
          {project.description}
        </div>
      )}
    </div>
  );
}
