import type { CSSProperties, Ref } from "react";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";

const DESKTOP_PROFILES = [
  { coverHeight: 232 },
  { coverHeight: 244 },
  { coverHeight: 238 },
  { coverHeight: 228 },
] as const;

const MOBILE_PROFILES = [
  { coverHeight: 174 },
  { coverHeight: 184 },
  { coverHeight: 179 },
  { coverHeight: 171 },
] as const;

const PAGE_RANGE = { min: 150, max: 650 } as const;
const SPINE_RANGE_DESKTOP = { min: 26, max: 44 } as const;
const SPINE_RANGE_MOBILE = { min: 20, max: 32 } as const;

export type BookMetrics = {
  spineWidth: number;
  coverWidth: number;
  coverHeight: number;
  spineOffsetX: number;
};

function getBookVariant(slug: string): number {
  return slug.length % DESKTOP_PROFILES.length;
}

function getSpineWidth(pageCount: number, isMobile: boolean): number {
  const normalized = Math.min(
    1,
    Math.max(
      0,
      (pageCount - PAGE_RANGE.min) / (PAGE_RANGE.max - PAGE_RANGE.min)
    )
  );
  const range = isMobile ? SPINE_RANGE_MOBILE : SPINE_RANGE_DESKTOP;
  return Math.round(range.min + normalized * (range.max - range.min));
}

export function getBookMetrics(
  isMobile: boolean,
  slug = "",
  pageCount = 300
): BookMetrics {
  const variant = getBookVariant(slug);
  const profile = isMobile
    ? MOBILE_PROFILES[variant]
    : DESKTOP_PROFILES[variant];
  const { coverHeight } = profile;
  const spineWidth = getSpineWidth(pageCount, isMobile);
  const coverWidth = Math.round(coverHeight * (isMobile ? 0.62 : 2 / 3));
  const spineOffsetX = spineWidth / 2;
  return { spineWidth, coverWidth, coverHeight, spineOffsetX };
}

function getSpinePalette(color?: string): { ink: string; ornament: string } {
  if (!color?.startsWith("#") || ![4, 7].includes(color.length)) {
    return {
      ink: "rgba(248, 249, 255, 0.94)",
      ornament: "rgba(248, 249, 255, 0.34)",
    };
  }

  const expanded =
    color.length === 4
      ? color
          .slice(1)
          .split("")
          .map(char => char + char)
          .join("")
      : color.slice(1);
  const channels = [0, 2, 4].map(
    offset => Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255
  );
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;

  return luminance > 0.58
    ? { ink: "rgba(27, 29, 36, 0.92)", ornament: "rgba(27, 29, 36, 0.3)" }
    : {
        ink: "rgba(248, 249, 255, 0.94)",
        ornament: "rgba(248, 249, 255, 0.34)",
      };
}

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  metrics: BookMetrics;
  innerRef?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
};

export default function Book3D({
  book,
  metrics,
  innerRef,
  className,
  style,
}: Props) {
  const spineBg =
    book.spineColor ??
    "color-mix(in srgb, var(--accent) 70%, var(--background))";
  const variant = getBookVariant(book.slug);
  const palette = getSpinePalette(book.spineColor);
  const titleLength = Array.from(book.title).length;
  const titleSize = titleLength > 23 ? 8.5 : titleLength > 17 ? 9.5 : 10.5;

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
        ["--spine-ink" as never]: palette.ink,
        ["--spine-ornament" as never]: palette.ornament,
        ["--spine-title-size" as never]: `${titleSize}px`,
        ["--book-tone" as never]: spineBg,
        ...style,
      }}
      aria-hidden={true}
    >
      <div className="book-face book-face-front" data-cover-variant={variant}>
        {book.cover ? (
          <div className="book-cover-art">
            <img
              className="book-cover-image"
              src={book.cover.src}
              srcSet={book.cover.srcSet}
              width={book.cover.width}
              height={book.cover.height}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div
            className="book-cover-fallback flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center font-mono"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            <span className="text-xs leading-snug">{book.title}</span>
            <span className="text-[10px] opacity-80">// {book.author}</span>
          </div>
        )}
        <span className="book-cover-hinge" aria-hidden="true" />
        {book.status === "reading" && (
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 left-0 h-[3px] bg-accent"
          />
        )}
      </div>

      <div className="book-face book-face-back" />
      <div className="book-face book-face-top" />
      <div className="book-face book-face-bottom" />

      <div
        className="book-face book-face-spine"
        data-spine-variant={variant}
        style={{
          backgroundColor: spineBg,
        }}
      >
        <span
          className="book-spine-rule book-spine-rule-top"
          aria-hidden="true"
        />
        <span
          className="book-spine-rule book-spine-rule-bottom"
          aria-hidden="true"
        />
        <div className="book-spine-label">
          <span
            className="book-spine-title"
            data-text-orient="mixed"
          >
            {book.title}
          </span>
          <span className="book-spine-divider" aria-hidden="true" />
          <span
            className="book-spine-author"
            data-text-orient="mixed"
          >
            {book.author}
          </span>
        </div>
        {book.status === "reading" && (
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 left-0 h-[3px] bg-accent"
          />
        )}
      </div>
    </div>
  );
}
