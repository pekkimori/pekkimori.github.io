type Props = {
  title: string;
  author: string;
  visible: boolean;
};

export default function HoverTooltip({ title, author, visible }: Props) {
  const inner = Math.max(title.length, author.length);
  const pad = (s: string) => s + " ".repeat(inner - s.length);
  const top = "╔═" + "═".repeat(inner) + "═╗";
  const mid1 = "║ " + pad(title) + " ║";
  const mid2 = "║ " + pad(author) + " ║";
  const bot = "╚═" + "═".repeat(inner) + "═╝";
  const ascii = `${top}\n${mid1}\n${mid2}\n${bot}`;

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute z-30 whitespace-pre font-mono text-[10px] leading-[1.05]",
        "text-accent",
        "transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        textShadow: "0 0 6px color-mix(in srgb, var(--accent) 40%, transparent)",
      }}
    >
      {ascii}
    </div>
  );
}
