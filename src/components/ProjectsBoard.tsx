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
}

const PROJECTS: Project[] = [
  {
    title: "Minerva Vibe Check",
    description:
      "Personality assessment for Minerva students. Find your campus identity.",
    highlights: [
      "Drag-and-drop legacy ranking with @dnd-kit — smooth, accessible, keyboard-navigable",
      "Firebase Auth restricted to @minerva.edu — Google OAuth + rate-limited login",
      "Enterprise-grade security: DOMPurify, CSP headers, CSRF protection, input sanitization",
      "AI-driven assessment engine cross-referencing ILO responses with legacy archetypes",
    ],
    tags: ["Next.js 15", "TypeScript", "Firebase", "Framer Motion", "Tailwind CSS", "dnd-kit", "OAuth", "AI"],
    link: "https://yourminervavibe.com/",
    github: "https://github.com/pekkimori/legacyquestionnaire",
    status: "live",
    icon: "🎭",
    previewColor: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    category: "Web App",
  },
  {
    title: "This Blog",
    description:
      "Personal blog and portfolio. Built with Astro for near-zero JS overhead, Tailwind for tight typographic control, and an obsessive eye for detail.",
    highlights: [
      "Static-first architecture with Astro islands — React only where interactivity is needed",
      "Multilingual routing across EN, PT, and JA with per-locale content collections",
      "Pagefind-powered full-text search — zero server, works at the edge",
      "Dynamic OG image generation via Satori and custom typography templates",
    ],
    tags: ["Astro", "TypeScript", "Tailwind", "Pagefind", "Satori", "i18n", "MDX"],
    link: "https://github.com/pekkimori/pekkimori.github.io",
    status: "live",
    icon: "🌐",
    previewColor: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
    category: "Blog",
  },
  {
    title: "Neru-box",
    description:
      "An app paired with a physical robot — Neru-box lives on your desk, reacts to your digital life, and keeps you company while you work.",
    highlights: [
      "BLE-connected companion app syncs state between phone, desktop, and robot in real time",
      "Event-driven expression engine maps calendar, focus sessions, and notifications to servo gestures",
      "Custom 3D-printed chassis with servo-controlled head; firmware written in MicroPython",
    ],
    tags: ["App", "Robotics", "IoT", "BLE", "MicroPython", "React", "3D Printing"],
    status: "wip",
    icon: "🤖",
    previewColor: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
    category: "Robotics",
  },
  {
    title: "MoodOS",
    description:
      "A tiny ambient OS overlay that changes your desktop's color palette based on the time of day, weather, and how long you've been staring at a screen.",
    highlights: [
      "Injects dynamic CSS variables into the OS accent colour API via native Node addons",
      "Weather + solar angle combined into a perceptual brightness model driving palette shifts",
      "Screen-time tracker via accessibility APIs feeds a fatigue curve that softens contrast over time",
    ],
    tags: ["Desktop App", "Electron", "Node.js", "Native Addons", "macOS", "API"],
    status: "wip",
    icon: "🎨",
    previewColor: "linear-gradient(135deg, #7c3aed 0%, #a21caf 100%)",
    category: "Desktop App",
  },
  {
    title: "Pixel Dungeon Mod",
    description:
      "A custom tileset and balance mod for Shattered Pixel Dungeon — reworked enemy AI, new item synergies, and a hand-drawn art style.",
    highlights: [
      "Extended enemy state machines with patrol, ambush, and retreat behaviours",
      "New item synergy graph allowing emergent combo chains not present in vanilla",
      "Full 16×16 hand-drawn tileset replacing all sprites across 5 dungeon biomes",
    ],
    tags: ["Game Mod", "Java", "Pixel Art", "LibGDX", "AI Behaviour"],
    status: "wip",
    icon: "⚔️",
    previewColor: "linear-gradient(135deg, #be123c 0%, #c2410c 100%)",
    category: "Game Mod",
  },
  {
    title: "Lantern",
    description:
      "A spaced-repetition flashcard app with a brutalist aesthetic — no animations, no fluff, just you and the cards. Syncs across devices via a tiny self-hosted server.",
    highlights: [
      "SM-2 algorithm with per-card ease modifiers and configurable daily review caps",
      "Offline-first: IndexedDB as the write-ahead store, syncs on reconnect via a diff-based protocol",
      "Self-hostable sync server in ~150 lines of Node — SQLite + Server-Sent Events for live push",
    ],
    tags: ["Web App", "React", "SQLite", "IndexedDB", "Node.js", "SSE", "SM-2"],
    status: "wip",
    icon: "🏮",
    previewColor: "linear-gradient(135deg, #d97706 0%, #ca8a04 100%)",
    category: "Web App",
  },
];

function StatusBadge({ status }: { status: "live" | "wip" }) {
  if (status === "live") {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
        </span>
        live
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/70" />
      wip
    </span>
  );
}

export default function ProjectsBoard() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="w-full font-mono">
      {/* Column header */}
      <div className="mb-1 flex items-center gap-3 border-b border-border pb-2 text-[9px] uppercase tracking-[0.18em] text-muted">
        <span className="w-9 shrink-0 text-right">#</span>
        <span className="flex-1">Project</span>
        <span className="hidden w-24 shrink-0 text-right sm:block">Category</span>
        <span className="w-14 shrink-0 text-right">Status</span>
        <span className="w-4 shrink-0" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {PROJECTS.map((project, i) => {
          const isOpen = open === i;
          return (
            <div key={project.title}>
              <button
                className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-foreground/[0.04]"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                {/* Index number */}
                <span
                  className="w-9 shrink-0 select-none text-right text-4xl font-bold leading-none"
                  style={{ color: "var(--border)", lineHeight: 1 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Title */}
                <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="text-base leading-none">{project.icon}</span>
                  {project.title}
                </span>

                {/* Category */}
                <span className="hidden w-24 shrink-0 text-right text-xs text-muted sm:block">
                  {project.category}
                </span>

                {/* Status */}
                <div className="flex w-14 shrink-0 justify-end">
                  <StatusBadge status={project.status ?? "wip"} />
                </div>

                {/* Chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 shrink-0 text-muted transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Accordion detail */}
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div className="relative ml-12 pb-6 pl-5">
                    {/* Project-color left bar */}
                    <div
                      className="absolute bottom-0 left-0 top-0 w-px"
                      style={{ background: project.previewColor }}
                    />

                    {/* Description */}
                    <p className="text-xs leading-relaxed text-muted">
                      {project.description}
                    </p>

                    {/* Highlights */}
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="mt-3.5 flex flex-col gap-2">
                        {project.highlights.map(h => (
                          <li key={h} className="flex items-start gap-2 text-xs text-muted">
                            <span className="mt-0.5 shrink-0 text-accent">▸</span>
                            <span className="leading-relaxed">{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tags + links */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {project.tags?.map(tag => (
                        <span
                          key={tag}
                          className="rounded border border-border px-1.5 py-0.5 text-[9px] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                      <div className="ml-auto flex items-center gap-4 pl-2">
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-accent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            Visit
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-accent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer count */}
      <div className="mt-3 border-t border-border pt-3 text-right text-[9px] uppercase tracking-widest text-muted">
        {PROJECTS.filter(p => p.status === "live").length} live ·{" "}
        {PROJECTS.filter(p => p.status === "wip").length} in progress ·{" "}
        {PROJECTS.length} total
      </div>
    </div>
  );
}
