import type { ImageMetadata } from "astro";

export type Lang = "en" | "pt" | "ja";

export type BookStatus = "read" | "reading" | "want-to-read";

export type BookI18n = {
  title: string;
  author: string;
  theme: string;
  review: string;
  quote?: string;
};

export type Book = {
  slug: string;
  cover: ImageMetadata | null;
  rating: 1 | 2 | 3 | 4 | 5;
  yearRead: number;
  originalYear: number;
  pageCount: number;
  status: BookStatus;
  spineColor?: string;
  i18n: Record<Lang, BookI18n>;
};

// Astro pages pre-resolve `cover` into this shape (or `null`) before passing to React.
export type ResolvedCover = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
} | null;

// Flattened single-locale shape consumed by Bookshelf.tsx.
// `cover` is the resolved shape, not the raw ImageMetadata.
export type LocalizedBook = Omit<Book, "i18n" | "cover"> & BookI18n & {
  cover: ResolvedCover;
};

export type SortMode = "alpha" | "theme" | "rating";
