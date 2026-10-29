import type { CSSProperties, Ref } from "react";
import type { Lang, LocalizedBook, ShelfView } from "./types";
import PixelCover from "./PixelCover";

const DESKTOP_PROFILES = [
  { coverHeight: 248 },
  { coverHeight: 264 },
  { coverHeight: 256 },
  { coverHeight: 240 },
] as const;

const MOBILE_PROFILES = [
  { coverHeight: 156 },
  { coverHeight: 168 },
  { coverHeight: 162 },
  { coverHeight: 150 },
] as const;

const PAGE_RANGE = { min: 150, max: 650 } as const;
const SPINE_RANGE_DESKTOP = { min: 26, max: 44 } as const;
const SPINE_RANGE_MOBILE = { min: 20, max: 32 } as const;
const BINDING_TEXTURES = ["linen", "laid", "twill", "grain"] as const;

function getBindingTexture(slug: string) {
  // Stable across SSR, shelf, flight, and review; no random texture swaps.
  let seed = 0;
  for (const character of slug)
    seed = (Math.imul(seed, 31) + character.charCodeAt(0)) >>> 0;
  return BINDING_TEXTURES[(seed >>> 8) % BINDING_TEXTURES.length];
}

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

export function getShelfBookMetrics(
  small: boolean,
  slug: string,
  pageCount: number,
  view: ShelfView
): BookMetrics {
  const base = getBookMetrics(small, slug, pageCount);
  const scale = view === "spines" ? (small ? 1 : 0.8) : small ? 0.76 : 0.62;
  const spineWidth = Math.round(base.spineWidth * scale);
  return {
    spineWidth,
    coverWidth: Math.round(base.coverWidth * scale),
    coverHeight: Math.round(base.coverHeight * scale),
    spineOffsetX: spineWidth / 2,
  };
}

export function getShelfSlotWidth(metrics: BookMetrics, view: ShelfView) {
  return view === "spines" ? metrics.spineWidth + 4 : metrics.coverWidth + 8;
}

type Props = {
  book: LocalizedBook;
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
  const titleLength = Array.from(book.title).length;

  return (
    <div
      ref={innerRef}
      className={["book-3d", className].filter(Boolean).join(" ")}
      data-binding-texture={getBindingTexture(book.slug)}
      data-binding={book.binding ?? "cloth"}
      style={{
        width: metrics.coverWidth,
        height: metrics.coverHeight,
        left: 0,
        right: "auto",
        transformOrigin: "50% 50%",
        ["--spine-thickness" as never]: `${metrics.spineWidth}px`,
        ["--spine-offset-x" as never]: "calc(var(--spine-thickness) / 2)",
        ["--spine-title-size" as never]: `${Math.min(5.4, 110 / titleLength)}cqh`,
        ["--book-tone" as never]:
          book.palette?.cloth ?? book.spineColor ?? "#42635b",
        ["--book-ink" as never]: book.palette?.ink ?? "#f5e7c9",
        ["--book-accent" as never]: book.palette?.accent ?? "#cfab68",
        ["--book-paper" as never]: book.palette?.paper ?? "#e7d7b5",
        ...style,
      }}
      aria-hidden={true}
    >
      <div className="book-face book-face-front">
        <div className="book-cover-type">
          <span className="book-cover-author">{book.author}</span>
          <span className="book-cover-title">{book.title}</span>
          <span className="book-cover-year">{book.originalYear}</span>
        </div>
        {book.cover && <PixelCover cover={book.cover} />}
      </div>

      <div className="book-face book-face-back" />
      <div className="book-face book-face-top" />
      <div className="book-face book-face-bottom" />
      <div className="book-face book-face-pages" />

      {/* Separate board edges overhang the recessed page block. */}
      {(["front", "back"] as const).map(side => (
        <div key={side} className={`book-board-rims book-board-rims-${side}`}>
          <span className="book-board-rim book-board-rim-top" />
          <span className="book-board-rim book-board-rim-bottom" />
          <span className="book-board-rim book-board-rim-fore" />
        </div>
      ))}

      <div className="book-face book-face-spine">
        <div className="book-spine-label">
          <span className="book-spine-title">{book.title}</span>
        </div>
      </div>
      <span className="book-spine-bevel book-spine-bevel-front" />
      <span className="book-spine-bevel book-spine-bevel-back" />
      {[0.12, 0.88].map(position => (
        <span
          key={position}
          className="book-raised-band"
          style={{ top: `${position * 100}%` }}
        />
      ))}
      <span className="book-headband" />
      <span className="book-ribbon" />
    </div>
  );
}
