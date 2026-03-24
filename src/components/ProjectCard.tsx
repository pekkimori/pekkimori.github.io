import { useRef, useState } from "react";

interface ProjectCardProps {
  title: string;
  description: string;
  highlights?: string[];
  tags?: string[];
  link?: string;
  github?: string;
  status?: "live" | "wip";
  icon?: string;
  /** "default" = vertical (preview top), "wide" = horizontal (preview left) */
  size?: "default" | "wide";
  /** CSS gradient/color string for the preview panel */
  previewColor?: string;
  /** Short category label shown in preview panel */
  category?: string;
}

export default function ProjectCard({
  title,
  description,
  highlights = [],
  tags = [],
  link,
  github,
  status = "live",
  icon,
  size = "default",
  previewColor = "linear-gradient(135deg, #3b3b52, #1e1e2e)",
  category,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -5;
    const rotY = ((x - cx) / cx) * 5;
    setTransform(`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.015)`);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setTransform("");
  }

  const hasLinks = link || github;

  const previewPanel = (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        size === "wide"
          ? "w-48 rounded-l-2xl rounded-r-none"
          : "h-40 w-full rounded-t-2xl rounded-b-none",
      ].join(" ")}
      style={{ background: previewColor }}
    >
      {/* Category label — top-left */}
      {category && (
        <span className="absolute top-3 left-3 rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-white/80 backdrop-blur-sm">
          {category}
        </span>
      )}

      {/* Status badge — top-right */}
      <div className="absolute top-3 right-3">
        <StatusBadge status={status} />
      </div>

      {/* Big icon */}
      {icon && (
        <span
          className="select-none text-6xl drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            transform: isHovered ? "scale(1.15) translateY(-3px)" : "scale(1)",
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </div>
  );

  const contentPanel = (
    <div className="flex flex-1 flex-col gap-3 p-5">
      {/* Title + links row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground leading-snug">
          {title}
        </h3>
        {hasLinks && (
          <div className="flex shrink-0 items-center gap-2">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit site"
                className="text-muted transition-colors hover:text-accent"
                title="Visit site"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted transition-colors hover:text-accent"
                title="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-muted">{description}</p>

      {/* Highlights */}
      {highlights.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
          {highlights.map(h => (
            <li key={h} className="flex items-start gap-1.5 text-xs text-muted">
              <span className="mt-0.5 shrink-0 text-accent">▸</span>
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={cardRef}
      style={{
        transform,
        transition: isHovered
          ? "transform 0.08s ease-out, box-shadow 0.2s ease"
          : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease",
        boxShadow: isHovered
          ? "0 12px 40px -10px rgba(0,0,0,0.25)"
          : "0 2px 8px -4px rgba(0,0,0,0.12)",
      }}
      className={[
        "group relative overflow-hidden rounded-2xl border border-border bg-background will-change-transform",
        size === "wide" ? "flex flex-row" : "flex flex-col",
      ].join(" ")}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {previewPanel}
      {contentPanel}

      {/* Hover accent border overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px var(--accent)" }}
      />
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
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-yellow-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500" />
      </span>
      in dev
    </span>
  );
}
