import { useEffect, useRef, useState } from "react";

const LINES: { text: string; pauseAfterMs?: number }[] = [
  { text: "$ whoami" },
  { text: "> rafael mori" },
  { text: "> polymath · INTJ 145 · truth · energy · love", pauseAfterMs: 400 },
  { text: "" },
  { text: "$ cat ~/intro.md" },
  { text: "> building systems, exploring brains.", pauseAfterMs: 300 },
  { text: "" },
  { text: "$ _" },
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AboutHeroTerminal() {
  const [rendered, setRendered] = useState<string[]>(() =>
    prefersReducedMotion() ? LINES.map(l => l.text) : []
  );
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    cancelledRef.current = false;

    let currentLine = 0;
    let currentChar = 0;
    const next: string[] = [];

    const tick = () => {
      if (cancelledRef.current) return;
      if (currentLine >= LINES.length) return;

      const line = LINES[currentLine];
      if (currentChar === 0) next.push("");

      if (currentChar < line.text.length) {
        next[currentLine] = line.text.slice(0, currentChar + 1);
        setRendered([...next]);
        currentChar += 1;
        const jitter = Math.random() * 20;
        setTimeout(tick, 30 + jitter);
      } else {
        currentLine += 1;
        currentChar = 0;
        const pause = line.pauseAfterMs ?? 120;
        setTimeout(tick, pause);
      }
    };

    tick();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background/80">
      <div className="flex items-center gap-2 border-b border-border bg-foreground/5 px-3 py-2">
        <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" aria-hidden="true" />
        <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" aria-hidden="true" />
        <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" aria-hidden="true" />
        <span className="ml-2 font-mono text-xs text-muted">
          rafael@polymath: ~
        </span>
      </div>
      <pre
        className="m-0 overflow-x-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed"
        aria-label="About me terminal"
      >
        {rendered.map((line, i) => (
          <span key={i}>
            {line}
            {i === rendered.length - 1 && (
              <span className="ml-0.5 inline-block w-2 animate-pulse bg-accent align-[-2px]">
                &nbsp;
              </span>
            )}
            {"\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}
