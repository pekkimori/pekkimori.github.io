import type { CSSProperties } from "react";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";

const SPINE_WIDTH_DESKTOP = 32;
const SPINE_WIDTH_MOBILE = 24;
const COVER_HEIGHT_DESKTOP = 240;
const COVER_HEIGHT_MOBILE = 180;
const COVER_WIDTH_DESKTOP = 160;
const COVER_WIDTH_MOBILE = 110;

export type BookMetrics = {
  spineWidth: number;
  coverWidth: number;
  coverHeight: number;
  spineOffsetX: number;
};

export function getBookMetrics(isMobile: boolean): BookMetrics {
  const spineWidth = isMobile ? SPINE_WIDTH_MOBILE : SPINE_WIDTH_DESKTOP;
  const coverWidth = isMobile ? COVER_WIDTH_MOBILE : COVER_WIDTH_DESKTOP;
  const coverHeight = isMobile ? COVER_HEIGHT_MOBILE : COVER_HEIGHT_DESKTOP;
  const spineOffsetX = spineWidth / 2;
  return { spineWidth, coverWidth, coverHeight, spineOffsetX };
}

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  metrics: BookMetrics;
  innerRef?: (el: HTMLDivElement | null) => void;
  className?: string;
  style?: CSSProperties;
};

export default function Book3D({
  book,
  lang,
  metrics,
  innerRef,
  className,
  style,
}: Props) {
  const tinted = book.spineColor ?? "var(--accent)";
  const spineBg =
    book.spineColor ??
    "color-mix(in srgb, var(--accent) 70%, var(--background))";
  const orient = lang === "ja" ? "vertical-ja" : "vertical-en";

  return (
    <div
      ref={innerRef}
      className={["book-3d", className].filter(Boolean).join(" ")}
      style={{
        width: metrics.coverWidth,
        height: metrics.coverHeight,
        left: 0,
        right: "auto",
        transformOrigin: `calc(${metrics.spineWidth / 2}px) 50%`,
        ["--spine-thickness" as never]: `${metrics.spineWidth}px`,
        ["--spine-offset-x" as never]: `${metrics.spineOffsetX}px`,
        ...style,
      }}
      aria-hidden={true}
    >
      <div
        className="book-face book-face-front"
        style={{
          background: tinted,
          border: "1px solid var(--border)",
        }}
      >
        {book.cover ? (
          <img
            src={book.cover.src}
            srcSet={book.cover.srcSet}
            width={book.cover.width}
            height={book.cover.height}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center font-mono"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            <span className="text-xs leading-snug">{book.title}</span>
            <span className="text-[10px] opacity-80">// {book.author}</span>
          </div>
        )}
        {book.status === "reading" && (
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[3px] bg-accent"
          />
        )}
      </div>

      <div className="book-face book-face-back" />
      <div className="book-face book-face-top" />
      <div className="book-face book-face-bottom" />

      <div
        className="book-face book-face-spine"
        style={{
          background: spineBg,
          borderTop: "1px solid rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(0,0,0,0.25)",
        }}
      >
        <div className="book-spine-label" data-orient={orient}>
          <span className="font-semibold">{book.title}</span>
          <span className="opacity-80">{book.author}</span>
        </div>
        {book.status === "reading" && (
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[3px] bg-accent"
          />
        )}
      </div>
    </div>
  );
}
