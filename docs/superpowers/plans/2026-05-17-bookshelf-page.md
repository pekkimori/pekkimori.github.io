# Bookshelf Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-owned `/bookshelf` page with 3D spine-to-cover animations, sort modes, and per-book modal, replacing the Goodreads link in the about-page card.

**Architecture:** A single React island (`Bookshelf.tsx`) is mounted by per-locale Astro pages (`/en/bookshelf`, `/pt/bookshelf`, `/ja/bookshelf`). Astro pre-resolves cover images through its image pipeline server-side and passes optimized `{src, srcSet, width, height}` metadata as props. GSAP timelines drive 3D rotations per book; sibling nudges, modal scroll-lock, focus trap, and `prefers-reduced-motion` are all handled inside the island.

**Tech Stack:** Astro 5, React 19, TypeScript, GSAP, Tailwind v4. No new dependencies.

**Project conventions:**
- This site has no test framework — the spec explicitly excludes tests. Each task's verification step is manual via `astro dev` plus `astro check`. The closest the codebase has to a CI check is `npx astro check && npx astro build`.
- Package manager is whichever lockfile resolves at install time (`pnpm-lock.yaml` is present). All command examples use `npx` so they work regardless.
- No emojis anywhere (per user preference).
- Theme colors via CSS vars: `--background`, `--foreground`, `--accent`, `--muted`, `--border`. Tailwind classes that map to them: `bg-background`, `text-foreground`, `text-accent`, `text-muted`, `border-border`.
- Fonts: `font-sans` (Inter), `font-serif` (Fraunces), `font-mono` (JetBrains Mono).

**Spec:** [`docs/superpowers/specs/2026-05-17-bookshelf-page-design.md`](../specs/2026-05-17-bookshelf-page-design.md)

---

## File structure

**New files:**
- `src/components/bookshelf/types.ts`
- `src/components/bookshelf/strings.ts`
- `src/components/bookshelf/StarBar.tsx`
- `src/components/bookshelf/Book.tsx`
- `src/components/bookshelf/BookModal.tsx`
- `src/components/bookshelf/Bookshelf.tsx`
- `src/components/bookshelf/bookshelf.css`
- `src/data/books.ts`
- `src/assets/books/.gitkeep`
- `src/pages/bookshelf.astro`
- `src/pages/en/bookshelf.astro`
- `src/pages/pt/bookshelf.astro`
- `src/pages/ja/bookshelf.astro`

**Edited files:**
- `src/components/about/BookshelfCard.astro`
- `src/components/about/Bookshelf.tsx`
- `src/data/about.ts`

---

### Task 1: Types and localized chrome strings

**Files:**
- Create: `src/components/bookshelf/types.ts`
- Create: `src/components/bookshelf/strings.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/components/bookshelf/types.ts
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
```

- [ ] **Step 2: Create the strings file**

```ts
// src/components/bookshelf/strings.ts
import type { Lang } from "./types";

export type Strings = {
  prompt: string;
  countsSuffix: (n: number, reading: number) => string;
  sortAZ: string;
  sortTheme: string;
  sortRating: string;
  empty: string;
  footerHover: string;
  footerTouch: string;
  modalClose: string;
  modalReviewLabel: string;
  modalPagesSuffix: string;
  modalFirstPublished: (year: number) => string;
  themeMarker: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    prompt: "$ cat ~/bookshelf/*",
    countsSuffix: (n, r) => `${n} books · ${r} currently reading`,
    sortAZ: "A–Z",
    sortTheme: "by theme",
    sortRating: "by rating",
    empty: "# shelf empty",
    footerHover: "# hover a spine to see the cover · click for review",
    footerTouch: "# tap once to lift · tap again for review",
    modalClose: "Close",
    modalReviewLabel: "review:",
    modalPagesSuffix: "pp",
    modalFirstPublished: y => `first published ${y}`,
    themeMarker: "//",
  },
  pt: {
    prompt: "$ cat ~/estante/*",
    countsSuffix: (n, r) => `${n} livros · ${r} lendo agora`,
    sortAZ: "A–Z",
    sortTheme: "por tema",
    sortRating: "por nota",
    empty: "# estante vazia",
    footerHover: "# passe sobre uma lombada · clique para a resenha",
    footerTouch: "# toque para girar · toque de novo para a resenha",
    modalClose: "Fechar",
    modalReviewLabel: "resenha:",
    modalPagesSuffix: "pp",
    modalFirstPublished: y => `publicado em ${y}`,
    themeMarker: "//",
  },
  ja: {
    prompt: "$ cat ~/本棚/*",
    countsSuffix: (n, r) => `${n}冊 · ${r}冊読書中`,
    sortAZ: "A–Z",
    sortTheme: "テーマ別",
    sortRating: "評価別",
    empty: "# 本棚は空です",
    footerHover: "# 背表紙にカーソルを合わせる · クリックで感想",
    footerTouch: "# タップで持ち上げる · もう一度で感想",
    modalClose: "閉じる",
    modalReviewLabel: "感想:",
    modalPagesSuffix: "ページ",
    modalFirstPublished: y => `初版 ${y}`,
    themeMarker: "//",
  },
};
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx astro check`
Expected: no errors related to the new files. (Existing pre-warnings unrelated to this feature are acceptable.)

- [ ] **Step 4: Commit**

```bash
git add src/components/bookshelf/types.ts src/components/bookshelf/strings.ts
git commit -m "feat(bookshelf): add types and localized chrome strings"
```

---

### Task 2: Book catalog with seed data

**Files:**
- Create: `src/data/books.ts`
- Create: `src/assets/books/.gitkeep`

- [ ] **Step 1: Create the assets directory placeholder**

```bash
mkdir -p src/assets/books
touch src/assets/books/.gitkeep
```

- [ ] **Step 2: Create the catalog**

The three migrated books all use `cover: null` for now (fallback face renders the title in monospace on a tinted background). Real cover JPGs can be dropped into `src/assets/books/` later and the `cover: null` swapped for `cover: <import>` per book.

```ts
// src/data/books.ts
import type { Book, Lang, LocalizedBook } from "@/components/bookshelf/types";

export const BOOKS: Book[] = [
  {
    slug: "laws-of-human-nature",
    cover: null,
    rating: 4,
    yearRead: 2024,
    originalYear: 2018,
    pageCount: 624,
    status: "read",
    spineColor: "#3b2f2f",
    i18n: {
      en: {
        title: "The Laws of Human Nature",
        author: "Robert Greene",
        theme: "philosophy",
        review:
          "A field manual disguised as a self-help book. Greene catalogs the recurring patterns of human behavior — narcissism, envy, grandiosity, conformity — and the result is less prescriptive than diagnostic.\n\nNot every chapter lands, but the through-line is sharp: you become less reactive when you stop expecting other people to be other than what they are.",
        quote:
          "Not to become someone else, but to be more thoroughly yourself.",
      },
      pt: {
        title: "As Leis da Natureza Humana",
        author: "Robert Greene",
        theme: "filosofia",
        review:
          "Um manual de campo disfarçado de livro de autoajuda. Greene cataloga os padrões recorrentes do comportamento humano — narcisismo, inveja, grandiosidade, conformidade — e o resultado é menos prescritivo do que diagnóstico.\n\nNem todo capítulo acerta, mas o fio condutor é nítido: você se torna menos reativo quando deixa de esperar que as pessoas sejam outra coisa além do que são.",
        quote:
          "Não para se tornar outra pessoa, mas para ser mais plenamente você mesmo.",
      },
      ja: {
        title: "人間性の法則",
        author: "ロバート・グリーン",
        theme: "哲学",
        review:
          "自己啓発書を装った実務マニュアル。グリーンはナルシシズム、嫉妬、誇大妄想、同調といった人間の反復するパターンを目録化していく。処方箋というより診断書だ。\n\n章ごとの当たり外れはあるが、貫かれている軸は鋭い：他人が他人であることをやめないと諦めたとき、人は反射的に反応しなくなる。",
        quote: "他の誰かになるのではなく、より徹底的に自分自身であること。",
      },
    },
  },
  {
    slug: "king-in-yellow",
    cover: null,
    rating: 5,
    yearRead: 2023,
    originalYear: 1895,
    pageCount: 316,
    status: "read",
    spineColor: "#7a6a1f",
    i18n: {
      en: {
        title: "The King in Yellow",
        author: "Robert W. Chambers",
        theme: "horror",
        review:
          "A collection of stories haunted by a forbidden play that drives its readers to madness. The conceit is that you never see the worst pages — only the wreckage left behind by people who did.\n\nChambers wrote this in 1895 and the dread still hums. Half of weird fiction since (Lovecraft especially) owes him an apology.",
        quote:
          "His mind is a wonder chamber, from which he can extract treasures that you and I would give years of our life to acquire.",
      },
      pt: {
        title: "O Rei de Amarelo",
        author: "Robert W. Chambers",
        theme: "horror",
        review:
          "Uma coletânea de contos assombrados por uma peça proibida que enlouquece quem a lê. O truque é que você nunca vê as piores páginas — só os destroços deixados por quem viu.\n\nChambers escreveu isso em 1895 e o pavor ainda zumbe. Boa parte da literatura estranha desde então (Lovecraft em especial) lhe deve um pedido de desculpas.",
        quote:
          "Sua mente é uma câmara de maravilhas, da qual ele extrai tesouros que você e eu daríamos anos de vida para adquirir.",
      },
      ja: {
        title: "黄衣の王",
        author: "ロバート・W・チェンバース",
        theme: "ホラー",
        review:
          "読み手を狂気へと駆り立てる禁断の戯曲に取り憑かれた短篇集。仕掛けは、最悪のページは決して見せず、それを読んでしまった人々が残した残骸だけを描くことにある。\n\nチェンバースは一八九五年にこれを書き、いまだに恐怖の通奏低音が鳴り止まない。ラヴクラフトを含むその後の奇想文学の半分は、彼に詫びを入れるべきだ。",
        quote:
          "彼の精神は驚異の小部屋であり、そこから彼は、あなたや私が数年の人生を差し出してでも手に入れたい宝を取り出してみせる。",
      },
    },
  },
  {
    slug: "rich-dad-poor-dad",
    cover: null,
    rating: 3,
    yearRead: 2022,
    originalYear: 1997,
    pageCount: 207,
    status: "read",
    spineColor: "#2f4d3a",
    i18n: {
      en: {
        title: "Rich Dad, Poor Dad",
        author: "Robert T. Kiyosaki",
        theme: "finance",
        review:
          "More an attitude than a book. Kiyosaki's central reframe — assets put money in your pocket, liabilities take it out — is repeated until it sticks, and the parables are thin.\n\nWorth reading once, mostly as a vaccine against the specific kind of middle-class financial superstition it argues against. Don't read the sequels.",
        quote:
          "Winners are not afraid of losing. But losers are. Failure is part of the process of success.",
      },
      pt: {
        title: "Pai Rico, Pai Pobre",
        author: "Robert T. Kiyosaki",
        theme: "finanças",
        review:
          "Mais uma postura do que um livro. A virada central de Kiyosaki — ativos colocam dinheiro no seu bolso, passivos tiram — é repetida até grudar, e as parábolas são rasas.\n\nVale a leitura uma vez, sobretudo como vacina contra o tipo específico de superstição financeira de classe média que ele combate. Não leia as continuações.",
        quote:
          "Vencedores não têm medo de perder. Mas perdedores têm. O fracasso faz parte do processo de sucesso.",
      },
      ja: {
        title: "金持ち父さん 貧乏父さん",
        author: "ロバート・キヨサキ",
        theme: "ファイナンス",
        review:
          "本というより姿勢の話。資産は財布に金を入れ、負債は金を抜く——というキヨサキの中心的な言い換えは、頭に染み込むまで繰り返され、寓話は薄い。\n\n一度は読む価値がある。とくに、彼が批判する中産階級的な財政の迷信に対するワクチンとして。続編は読まなくていい。",
        quote:
          "勝者は負けることを恐れない。だが敗者は恐れる。失敗は成功の過程の一部だ。",
      },
    },
  },
];

export function getBooksForLocale(lang: Lang): Omit<LocalizedBook, "cover">[] {
  return BOOKS.map(({ i18n, cover: _cover, ...rest }) => ({
    ...rest,
    ...i18n[lang],
  }));
}

export function getBookCounts(): { total: number; reading: number } {
  return {
    total: BOOKS.length,
    reading: BOOKS.filter(b => b.status === "reading").length,
  };
}
```

Note: `getBooksForLocale` returns `Omit<LocalizedBook, "cover">` because cover resolution happens in the Astro page (which has access to `getImage()`). The Astro page merges resolved covers in before passing to React.

- [ ] **Step 3: Verify type-check passes**

Run: `npx astro check`
Expected: no errors from `src/data/books.ts` or `types.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/data/books.ts src/assets/books/.gitkeep
git commit -m "feat(bookshelf): add book catalog with seed data"
```

---

### Task 3: StarBar component

**Files:**
- Create: `src/components/bookshelf/StarBar.tsx`

- [ ] **Step 1: Create the StarBar component**

```tsx
// src/components/bookshelf/StarBar.tsx
type Props = {
  rating: 1 | 2 | 3 | 4 | 5;
  className?: string;
};

export default function StarBar({ rating, className = "" }: Props) {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return (
    <span
      className={`font-mono text-accent ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      <span aria-hidden="true">{filled}{empty}</span>
    </span>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/bookshelf/StarBar.tsx
git commit -m "feat(bookshelf): add StarBar rating component"
```

---

### Task 4: Bookshelf CSS (3D, faces, reduced motion)

**Files:**
- Create: `src/components/bookshelf/bookshelf.css`

This file holds the CSS that's awkward to express as Tailwind utilities (3D transforms, custom keyframes, `prefers-reduced-motion` overrides). It's imported by `Bookshelf.tsx`.

- [ ] **Step 1: Create the CSS file**

```css
/* src/components/bookshelf/bookshelf.css */

.bookshelf-row {
  perspective: 1200px;
  perspective-origin: 50% 60%;
}

.book-slot {
  position: relative;
  flex: 0 0 auto;
  /* width/height set via inline style by the React component (responsive) */
}

.book-3d {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  will-change: transform;
  /* Initial state: spine facing the viewer.
     The spine face is on the +X edge of the book; rotating the whole
     book -90deg around Y brings that edge to face the camera. */
  transform: rotateY(-90deg);
}

.book-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 2px;
  overflow: hidden;
}

.book-face-spine {
  /* Lives on the right edge of the book block. We translate it out by
     half the cover-width minus half the spine-width so its left edge
     aligns with the book's right edge, then rotate it 90deg. */
  /* Concrete transforms are applied via CSS custom properties set inline. */
  transform: translateX(var(--spine-offset-x)) rotateY(90deg);
  width: var(--spine-thickness);
}

.book-face-front {
  /* Front face stays in the XY plane, pushed out by half the spine thickness. */
  transform: translateZ(calc(var(--spine-thickness) / 2));
}

.book-face-back {
  transform: translateZ(calc(var(--spine-thickness) / -2)) rotateY(180deg);
  background: var(--background);
}

.book-face-top,
.book-face-bottom {
  height: 4px;
  width: 100%;
  background: linear-gradient(180deg, #d9c8a6, #b09a72);
}

.book-face-top {
  top: 0;
  transform: translateY(calc(var(--spine-thickness) / -2)) rotateX(90deg);
  transform-origin: top center;
}

.book-face-bottom {
  bottom: 0;
  transform: translateY(calc(var(--spine-thickness) / 2)) rotateX(-90deg);
  transform-origin: bottom center;
}

/* The spine's printed text. Default writing direction is set inline
   per-locale: en/pt use vertical-rl + rotate to read top-down along the
   spine; ja uses native vertical-rl. */
.book-spine-label {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px 2px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}

.book-spine-label[data-orient="vertical-en"] {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.book-spine-label[data-orient="vertical-ja"] {
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.shelf-baseline {
  height: 6px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--border) 80%, transparent), color-mix(in srgb, var(--border) 30%, transparent));
  border-radius: 1px;
  box-shadow: 0 6px 14px -8px color-mix(in srgb, var(--foreground) 40%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .bookshelf-row {
    perspective: none;
  }
  .book-3d {
    transform: none !important;
    position: relative;
  }
  .book-face {
    position: relative;
    inset: auto;
  }
  .book-face-spine,
  .book-face-back,
  .book-face-top,
  .book-face-bottom {
    display: none;
  }
  .book-face-front {
    transform: none;
  }
}
```

- [ ] **Step 2: Verify the file is syntactically valid**

Run: `npx astro check`
Expected: no errors (Astro check doesn't fully validate CSS but won't fail on imports).

- [ ] **Step 3: Commit**

```bash
git add src/components/bookshelf/bookshelf.css
git commit -m "feat(bookshelf): add 3D shelf CSS with reduced-motion fallback"
```

---

### Task 5: Book component (single book with GSAP)

**Files:**
- Create: `src/components/bookshelf/Book.tsx`

- [ ] **Step 1: Create the Book component**

```tsx
// src/components/bookshelf/Book.tsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";

const SPINE_WIDTH_DESKTOP = 32;
const SPINE_WIDTH_MOBILE = 24;
const COVER_HEIGHT_DESKTOP = 240;
const COVER_HEIGHT_MOBILE = 180;
const COVER_WIDTH_DESKTOP = 160;
const COVER_WIDTH_MOBILE = 110;

type Props = {
  book: LocalizedBook & { cover: ResolvedCover };
  lang: Lang;
  showRating: boolean;
  isLifted: boolean;
  hasHover: boolean;
  isMobile: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
  onFocus: () => void;
  onBlur: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
};

export default function Book({
  book,
  lang,
  showRating,
  isLifted,
  hasHover,
  isMobile,
  onPointerEnter,
  onPointerLeave,
  onClick,
  onFocus,
  onBlur,
  registerRef,
}: Props) {
  const inner3DRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const spineWidth = isMobile ? SPINE_WIDTH_MOBILE : SPINE_WIDTH_DESKTOP;
  const coverWidth = isMobile ? COVER_WIDTH_MOBILE : COVER_WIDTH_DESKTOP;
  const coverHeight = isMobile ? COVER_HEIGHT_MOBILE : COVER_HEIGHT_DESKTOP;
  const spineOffsetX = (coverWidth - spineWidth) / 2;

  // Create the GSAP timeline once. It runs forward on lift, reverses on settle.
  useEffect(() => {
    if (!inner3DRef.current) return;
    const tl = gsap.timeline({ paused: true });
    tl.to(inner3DRef.current, {
      rotateY: 0,
      z: 40,
      y: -12,
      duration: 0.42,
      ease: "power3.out",
    }).to(
      inner3DRef.current,
      { scale: 1.04, duration: 0.18, ease: "power2.out" },
      "-=0.12"
    );
    timelineRef.current = tl;
    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, []);

  // Drive the timeline based on lifted state.
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (isLifted) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.3).reverse();
    }
  }, [isLifted]);

  const tinted = book.spineColor ?? "var(--accent)";
  // Spine background uses spineColor at full strength so printed text reads white.
  const spineBg = book.spineColor ?? "color-mix(in srgb, var(--accent) 70%, var(--background))";

  const orient = lang === "ja" ? "vertical-ja" : "vertical-en";

  const ariaLabel = `${book.title} by ${book.author}${
    book.status === "reading" ? " (currently reading)" : ""
  }`;

  // The slot reserves space at spine-width. The .book-3d inner div is absolutely
  // positioned at the full cover dimensions, anchored to the slot's right edge so
  // when it rotates to face the viewer, it grows leftward without overlapping the
  // next book unless lifted (which we want — it visually pops over neighbors).
  return (
    <div className="flex flex-col items-center">
      <div
        className="book-slot"
        style={{
          width: spineWidth,
          height: coverHeight,
          opacity: book.status === "want-to-read" ? 0.6 : 1,
          // CSS custom props consumed by bookshelf.css faces.
          ["--spine-thickness" as never]: `${spineWidth}px`,
          ["--spine-offset-x" as never]: `${spineOffsetX}px`,
        }}
      >
        <div
          ref={el => {
            inner3DRef.current = el;
            registerRef(el);
          }}
          className="book-3d"
          style={{
            width: coverWidth,
            height: coverHeight,
            // Anchor the inner block to the slot's right edge so the spine face
            // (which sits on the +X side of the inner block after the rotateY(-90deg))
            // visually lines up with the slot.
            right: 0,
            left: "auto",
            transformOrigin: `calc(100% - ${spineWidth / 2}px) 50%`,
          }}
          aria-hidden={true}
        >
          {/* Front face (cover) */}
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

          {/* Back face */}
          <div className="book-face book-face-back" />

          {/* Top + bottom slivers */}
          <div className="book-face book-face-top" />
          <div className="book-face book-face-bottom" />

          {/* Spine face */}
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

        {/* The interactive button overlays the slot. Keeps semantics simple. */}
        <button
          type="button"
          aria-label={ariaLabel}
          onMouseEnter={hasHover ? onPointerEnter : undefined}
          onMouseLeave={hasHover ? onPointerLeave : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent outline-offset-2 outline-accent focus-visible:outline-2 focus-visible:outline-dashed"
        />
      </div>

      {showRating && (
        <div className="mt-2 font-mono text-[10px] text-accent">
          <span aria-label={`${book.rating} out of 5 stars`}>
            <span aria-hidden="true">
              {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/bookshelf/Book.tsx
git commit -m "feat(bookshelf): add 3D Book component with GSAP timeline"
```

---

### Task 6: BookModal component

**Files:**
- Create: `src/components/bookshelf/BookModal.tsx`

- [ ] **Step 1: Create the modal**

```tsx
// src/components/bookshelf/BookModal.tsx
import { useEffect, useRef } from "react";
import type { Lang, LocalizedBook, ResolvedCover } from "./types";
import { STRINGS } from "./strings";

type Props = {
  book: (LocalizedBook & { cover: ResolvedCover }) | null;
  lang: Lang;
  onClose: () => void;
};

export default function BookModal({ book, lang, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "bookshelf-modal-title";
  const s = STRINGS[lang];

  // Scroll lock + focus management
  useEffect(() => {
    if (!book) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          "button, [href], input, [tabindex]:not([tabindex='-1'])"
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [book, onClose]);

  if (!book) return null;

  const reviewParagraphs = book.review.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  return (
    <div
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", backdropFilter: "blur(4px)" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[80vh] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
        style={{ animation: "bookModalIn 180ms ease-out" }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={s.modalClose}
          className="absolute top-3 right-3 size-8 font-mono text-lg text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-accent"
        >
          ×
        </button>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div
            className="shrink-0 self-center sm:self-start"
            style={{
              width: 120,
              height: 180,
              background: book.spineColor ?? "var(--accent)",
              borderRadius: 4,
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {book.cover ? (
              <img
                src={book.cover.src}
                srcSet={book.cover.srcSet}
                width={book.cover.width}
                height={book.cover.height}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center font-mono"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                <span className="text-xs leading-snug">{book.title}</span>
                <span className="text-[10px] opacity-80">// {book.author}</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 id={titleId} className="text-xl font-semibold leading-tight">
              {book.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{book.author}</p>
            <div className="mt-3 font-mono text-xs text-foreground/80">
              <span aria-label={`${book.rating} out of 5 stars`}>
                <span aria-hidden="true" className="text-accent">
                  {"★".repeat(book.rating)}{"☆".repeat(5 - book.rating)}
                </span>
              </span>
              <span className="mx-2 text-muted">·</span>
              <span>{book.yearRead}</span>
              <span className="mx-2 text-muted">·</span>
              <span>{book.pageCount}{s.modalPagesSuffix}</span>
              <span className="mx-2 text-muted">·</span>
              <span>{book.theme}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted">
              {s.modalFirstPublished(book.originalYear)}
            </p>
          </div>
        </div>

        {book.quote && (
          <>
            <hr className="my-5 border-border" />
            <figure className="text-center">
              <blockquote className="font-mono text-sm italic">
                "{book.quote}"
              </blockquote>
              <figcaption className="mt-2 font-mono text-xs text-muted">
                — {book.title}
              </figcaption>
            </figure>
          </>
        )}

        <hr className="my-5 border-border" />

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
            {s.modalReviewLabel}
          </h3>
          <div className="mt-2 space-y-3 font-serif text-sm leading-relaxed">
            {reviewParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the modal entry keyframe to `bookshelf.css`**

Append to the end of `src/components/bookshelf/bookshelf.css`:

```css
@keyframes bookModalIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  [style*="bookModalIn"] {
    animation: none !important;
  }
}
```

- [ ] **Step 3: Verify type-check**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/bookshelf/BookModal.tsx src/components/bookshelf/bookshelf.css
git commit -m "feat(bookshelf): add BookModal with focus trap and scroll lock"
```

---

### Task 7: Bookshelf root component (sort UI, layout, state)

**Files:**
- Create: `src/components/bookshelf/Bookshelf.tsx`

- [ ] **Step 1: Create the root component**

```tsx
// src/components/bookshelf/Bookshelf.tsx
import { useEffect, useMemo, useState } from "react";
import "./bookshelf.css";
import Book from "./Book";
import BookModal from "./BookModal";
import { STRINGS } from "./strings";
import type {
  Lang,
  LocalizedBook,
  ResolvedCover,
  SortMode,
} from "./types";

type BookForRender = LocalizedBook & { cover: ResolvedCover };

type Props = {
  lang: Lang;
  books: BookForRender[];
};

function useHoverCapable(): boolean {
  const [hover, setHover] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return hover;
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

function groupByTheme(
  books: BookForRender[],
  collator: Intl.Collator
): Array<{ theme: string; items: BookForRender[] }> {
  const map = new Map<string, BookForRender[]>();
  for (const b of books) {
    const list = map.get(b.theme) ?? [];
    list.push(b);
    map.set(b.theme, list);
  }
  const themes = [...map.keys()].sort(collator.compare);
  return themes.map(theme => ({
    theme,
    items: [...(map.get(theme) ?? [])].sort((a, b) =>
      collator.compare(a.title, b.title)
    ),
  }));
}

function sortAlpha(books: BookForRender[], collator: Intl.Collator) {
  return [...books].sort((a, b) => collator.compare(a.title, b.title));
}

function sortRating(books: BookForRender[], collator: Intl.Collator) {
  return [...books].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.yearRead !== a.yearRead) return b.yearRead - a.yearRead;
    return collator.compare(a.title, b.title);
  });
}

function partitionByStatus(books: BookForRender[]): BookForRender[] {
  // Put "want-to-read" at the end of the array regardless of sort.
  const main = books.filter(b => b.status !== "want-to-read");
  const tail = books.filter(b => b.status === "want-to-read");
  return [...main, ...tail];
}

export default function Bookshelf({ lang, books }: Props) {
  const s = STRINGS[lang];
  const [sort, setSort] = useState<SortMode>("alpha");
  const [liftedSlug, setLiftedSlug] = useState<string | null>(null);
  const [modalSlug, setModalSlug] = useState<string | null>(null);

  const hasHover = useHoverCapable();
  const isMobile = useIsMobile();

  const collator = useMemo(
    () => new Intl.Collator(lang, { sensitivity: "base" }),
    [lang]
  );

  const counts = useMemo(
    () => ({
      total: books.length,
      reading: books.filter(b => b.status === "reading").length,
    }),
    [books]
  );

  const shelves = useMemo<
    Array<{ theme?: string; items: BookForRender[] }>
  >(() => {
    if (sort === "theme") {
      return groupByTheme(books, collator).map(g => ({
        theme: g.theme,
        items: partitionByStatus(g.items),
      }));
    }
    if (sort === "rating") {
      return [{ items: partitionByStatus(sortRating(books, collator)) }];
    }
    return [{ items: partitionByStatus(sortAlpha(books, collator)) }];
  }, [books, collator, sort]);

  const modalBook = useMemo(
    () => books.find(b => b.slug === modalSlug) ?? null,
    [books, modalSlug]
  );

  const handleBookClick = (slug: string) => {
    if (hasHover) {
      setModalSlug(slug);
      setLiftedSlug(slug);
      return;
    }
    // Touch: first tap lifts, second tap opens modal.
    if (liftedSlug === slug) {
      setModalSlug(slug);
    } else {
      setLiftedSlug(slug);
    }
  };

  const handleSortKey = (
    e: React.KeyboardEvent<HTMLDivElement>,
    modes: SortMode[]
  ) => {
    const idx = modes.indexOf(sort);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setSort(modes[(idx + 1) % modes.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSort(modes[(idx - 1 + modes.length) % modes.length]);
    }
  };

  const modes: SortMode[] = ["alpha", "theme", "rating"];
  const sortLabels: Record<SortMode, string> = {
    alpha: s.sortAZ,
    theme: s.sortTheme,
    rating: s.sortRating,
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="font-mono text-xs uppercase tracking-wider text-accent">
          {s.prompt}
        </div>
        <div className="font-mono text-sm text-muted">
          {s.countsSuffix(counts.total, counts.reading)}
        </div>
      </header>

      <div
        role="group"
        aria-label={s.sortAZ}
        onKeyDown={e => handleSortKey(e, modes)}
        className="flex flex-wrap items-center gap-2 font-mono text-xs"
      >
        {modes.map(m => {
          const active = sort === m;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              onClick={() => setSort(m)}
              className={[
                "rounded-md border px-3 py-1 transition-colors",
                active
                  ? "border-accent text-accent font-semibold underline underline-offset-4"
                  : "border-border text-muted hover:text-foreground",
              ].join(" ")}
            >
              {sortLabels[m]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8">
        {books.length === 0 ? (
          <p className="font-mono text-sm text-muted">{s.empty}</p>
        ) : (
          shelves.map((shelf, i) => (
            <section key={shelf.theme ?? `shelf-${i}`} className="flex flex-col gap-3">
              {shelf.theme && (
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
                  {s.themeMarker} {shelf.theme}
                </h2>
              )}
              <div className="bookshelf-row flex flex-wrap items-end gap-[6px] sm:gap-[6px]">
                {shelf.items.map(book => (
                  <Book
                    key={book.slug}
                    book={book}
                    lang={lang}
                    showRating={sort === "rating"}
                    isLifted={liftedSlug === book.slug}
                    hasHover={hasHover}
                    isMobile={isMobile}
                    onPointerEnter={() => setLiftedSlug(book.slug)}
                    onPointerLeave={() => {
                      if (modalSlug !== book.slug) setLiftedSlug(null);
                    }}
                    onFocus={() => setLiftedSlug(book.slug)}
                    onBlur={() => {
                      if (modalSlug !== book.slug) setLiftedSlug(null);
                    }}
                    onClick={() => handleBookClick(book.slug)}
                    registerRef={() => {}}
                  />
                ))}
              </div>
              <div className="shelf-baseline" aria-hidden="true" />
            </section>
          ))
        )}
      </div>

      <p
        aria-hidden="true"
        className="font-mono text-[10px] text-muted text-center"
      >
        {hasHover ? s.footerHover : s.footerTouch}
      </p>

      <BookModal
        book={modalBook}
        lang={lang}
        onClose={() => {
          setModalSlug(null);
          // Settle the lifted book ~180ms after modal close (spec §3D animation).
          window.setTimeout(() => setLiftedSlug(null), 180);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/bookshelf/Bookshelf.tsx
git commit -m "feat(bookshelf): add root Bookshelf component with sort and modal wiring"
```

---

### Task 8: Astro pages (per-locale + redirect)

**Files:**
- Create: `src/pages/en/bookshelf.astro`
- Create: `src/pages/pt/bookshelf.astro`
- Create: `src/pages/ja/bookshelf.astro`
- Create: `src/pages/bookshelf.astro`

The three per-locale pages share most code. They differ only in the `lang` constant. Each page resolves cover images server-side and passes a fully-prepared `books` array into the React island.

- [ ] **Step 1: Create `src/pages/en/bookshelf.astro`**

```astro
---
import { getImage } from "astro:assets";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Hr from "@/components/Hr.astro";
import Bookshelf from "@/components/bookshelf/Bookshelf";
import { BOOKS, getBooksForLocale } from "@/data/books";
import type { ResolvedCover } from "@/components/bookshelf/types";

const lang = "en" as const;

const localized = getBooksForLocale(lang);

// Resolve each cover via Astro's image pipeline (server-side).
const resolvedCovers = await Promise.all(
  BOOKS.map(async (b): Promise<ResolvedCover> => {
    if (!b.cover) return null;
    const img = await getImage({
      src: b.cover,
      widths: [160, 320, 480],
      formats: ["avif", "webp"],
    });
    return {
      src: img.src,
      srcSet: img.srcSet.attribute,
      width: img.attributes.width as number,
      height: img.attributes.height as number,
    };
  })
);

const books = localized.map((b, i) => ({ ...b, cover: resolvedCovers[i] }));
---

<Layout lang={lang} title="Bookshelf">
  <Header />
  <main id="main-content">
    <section class="pt-8 pb-6">
      <h1 class="text-3xl font-semibold">bookshelf</h1>
    </section>
    <Hr />
    <section class="py-8">
      <Bookshelf lang={lang} books={books} client:load />
    </section>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 2: Create `src/pages/pt/bookshelf.astro`**

Identical to the `/en/` page except `lang = "pt"` and `title="Estante"`, `<h1>estante</h1>`.

```astro
---
import { getImage } from "astro:assets";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Hr from "@/components/Hr.astro";
import Bookshelf from "@/components/bookshelf/Bookshelf";
import { BOOKS, getBooksForLocale } from "@/data/books";
import type { ResolvedCover } from "@/components/bookshelf/types";

const lang = "pt" as const;

const localized = getBooksForLocale(lang);

const resolvedCovers = await Promise.all(
  BOOKS.map(async (b): Promise<ResolvedCover> => {
    if (!b.cover) return null;
    const img = await getImage({
      src: b.cover,
      widths: [160, 320, 480],
      formats: ["avif", "webp"],
    });
    return {
      src: img.src,
      srcSet: img.srcSet.attribute,
      width: img.attributes.width as number,
      height: img.attributes.height as number,
    };
  })
);

const books = localized.map((b, i) => ({ ...b, cover: resolvedCovers[i] }));
---

<Layout lang={lang} title="Estante">
  <Header />
  <main id="main-content">
    <section class="pt-8 pb-6">
      <h1 class="text-3xl font-semibold">estante</h1>
    </section>
    <Hr />
    <section class="py-8">
      <Bookshelf lang={lang} books={books} client:load />
    </section>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 3: Create `src/pages/ja/bookshelf.astro`**

```astro
---
import { getImage } from "astro:assets";
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Hr from "@/components/Hr.astro";
import Bookshelf from "@/components/bookshelf/Bookshelf";
import { BOOKS, getBooksForLocale } from "@/data/books";
import type { ResolvedCover } from "@/components/bookshelf/types";

const lang = "ja" as const;

const localized = getBooksForLocale(lang);

const resolvedCovers = await Promise.all(
  BOOKS.map(async (b): Promise<ResolvedCover> => {
    if (!b.cover) return null;
    const img = await getImage({
      src: b.cover,
      widths: [160, 320, 480],
      formats: ["avif", "webp"],
    });
    return {
      src: img.src,
      srcSet: img.srcSet.attribute,
      width: img.attributes.width as number,
      height: img.attributes.height as number,
    };
  })
);

const books = localized.map((b, i) => ({ ...b, cover: resolvedCovers[i] }));
---

<Layout lang={lang} title="本棚">
  <Header />
  <main id="main-content">
    <section class="pt-8 pb-6">
      <h1 class="text-3xl font-semibold">本棚</h1>
    </section>
    <Hr />
    <section class="py-8">
      <Bookshelf lang={lang} books={books} client:load />
    </section>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 4: Create `src/pages/bookshelf.astro` redirect**

```astro
---
return Astro.redirect("/en/bookshelf", 301);
---
```

- [ ] **Step 5: Verify build**

Run: `npx astro check`
Expected: no errors.

Run: `npx astro build`
Expected: build succeeds; output includes `dist/en/bookshelf/index.html`, `dist/pt/bookshelf/index.html`, `dist/ja/bookshelf/index.html`.

- [ ] **Step 6: Manual visual check**

Run: `npx astro dev`
- Open `http://localhost:4321/en/bookshelf` — page renders three book spines on a shelf with the heading "bookshelf" and a sort control.
- Hover a spine — it rotates forward and lifts, revealing the placeholder cover face with the title in monospace.
- Click — modal opens with title, author, star rating, quote, and review prose.
- Tab through with keyboard — each book is focusable; Enter opens the modal; Esc closes.
- Switch sort modes — A–Z, by theme (3 themed shelves), by rating (single shelf with star bars under each book).
- Open `http://localhost:4321/pt/bookshelf` — content is Portuguese; modal close button says "Fechar".
- Open `http://localhost:4321/ja/bookshelf` — content is Japanese; spine text is vertical; modal close button says "閉じる".
- Open `http://localhost:4321/bookshelf` — redirects to `/en/bookshelf`.
- DevTools: emulate `prefers-reduced-motion: reduce` — books render as flat cover thumbnails in a grid, no 3D, no rotations.

- [ ] **Step 7: Commit**

```bash
git add src/pages/en/bookshelf.astro src/pages/pt/bookshelf.astro src/pages/ja/bookshelf.astro src/pages/bookshelf.astro
git commit -m "feat(bookshelf): add per-locale pages and redirect"
```

---

### Task 9: Update About-page BookshelfCard

**Files:**
- Modify: `src/components/about/BookshelfCard.astro`
- Modify: `src/components/about/Bookshelf.tsx`
- Modify: `src/data/about.ts`

- [ ] **Step 1: Inline the ASCII data into `src/components/about/Bookshelf.tsx`**

Replace the entire file contents with the inlined version below (removes the `@/data/about` import so the about card no longer depends on the old `BOOKS` array):

```tsx
// src/components/about/Bookshelf.tsx
import { useState } from "react";

type AsciiBook = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};

const ASCII_BOOKS: AsciiBook[] = [
  {
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    quote: "Not to become someone else, but to be more thoroughly yourself.",
    asciiCover: [
      "╔═════════════╗",
      "║             ║",
      "║  THE LAWS   ║",
      "║     OF      ║",
      "║   HUMAN     ║",
      "║   NATURE    ║",
      "║             ║",
      "╠═════════════╣",
      "║  R. GREENE  ║",
      "╚═════════════╝",
    ].join("\n"),
  },
  {
    title: "The King in Yellow",
    author: "Robert W. Chambers",
    quote:
      "His mind is a wonder chamber, from which he can extract treasures that you and I would give years of our life to acquire.",
    asciiCover: [
      "╔═════════════╗",
      "║ * * * * * * ║",
      "║             ║",
      "║  THE KING   ║",
      "║     IN      ║",
      "║   YELLOW    ║",
      "║             ║",
      "╠═════════════╣",
      "║  CHAMBERS   ║",
      "╚═════════════╝",
    ].join("\n"),
  },
  {
    title: "Rich Dad, Poor Dad",
    author: "Robert T. Kiyosaki",
    quote:
      "Winners are not afraid of losing. But losers are. Failure is part of the process of success. People who avoid failure also avoid success.",
    asciiCover: [
      "╔═════════════╗",
      "║  RICH DAD   ║",
      "║  POOR DAD   ║",
      "║             ║",
      "║  $ . . . $  ║",
      "║             ║",
      "║   what is   ║",
      "╠═════════════╣",
      "║ R. KIYOSAKI ║",
      "╚═════════════╝",
    ].join("\n"),
  },
];

export default function Bookshelf() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {ASCII_BOOKS.map((book, i) => {
          const isActive = activeIndex === i;
          return (
            <button
              key={book.title}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
              onClick={() => setActiveIndex(isActive ? null : i)}
              aria-label={`${book.title} by ${book.author}`}
              className={[
                "origin-bottom font-mono text-[9px] leading-[1.1] whitespace-pre transition-transform duration-300",
                "hover:-translate-y-1 hover:-rotate-[4deg] focus:-translate-y-1 focus:-rotate-[4deg] focus:outline-none",
                "motion-reduce:transform-none motion-reduce:transition-none",
                isActive ? "text-accent" : "text-foreground/80",
              ].join(" ")}
            >
              <span aria-hidden="true">{book.asciiCover}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none text-border"
      >
        {"=".repeat(200)}
      </div>

      <p className="font-mono text-[10px] text-muted text-center">
        # three books. three roberts. it was not intentional.
      </p>

      <div className="min-h-[3rem] text-center">
        {activeIndex !== null ? (
          <figure>
            <blockquote className="font-mono text-sm italic">
              "{ASCII_BOOKS[activeIndex].quote}"
            </blockquote>
            <figcaption className="mt-1 font-mono text-xs text-muted">
              — {ASCII_BOOKS[activeIndex].title}, {ASCII_BOOKS[activeIndex].author}
            </figcaption>
          </figure>
        ) : (
          <p className="font-mono text-xs text-muted">
            hover a book to read a quote
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/components/about/BookshelfCard.astro`**

Full replacement (detects locale from `Astro.url.pathname`, shows internal link with book counts):

```astro
---
import BentoCard from "./BentoCard.astro";
import Bookshelf from "./Bookshelf";
import { getBookCounts } from "@/data/books";

const path = Astro.url.pathname;
const lang: "en" | "pt" | "ja" = path.startsWith("/pt")
  ? "pt"
  : path.startsWith("/ja")
    ? "ja"
    : "en";

const labels = {
  en: { link: "browse full shelf →", subtitle: (n: number, r: number) => `${n} books · ${r} reading` },
  pt: { link: "ver estante completa →", subtitle: (n: number, r: number) => `${n} livros · ${r} lendo` },
  ja: { link: "本棚を見る →", subtitle: (n: number, r: number) => `${n}冊 · ${r}冊読書中` },
};

const counts = getBookCounts();
const labelSet = labels[lang];
const href = `/${lang}/bookshelf`;
---

<BentoCard prompt="$ ls ~/bookshelf">
  <div class="flex flex-col gap-4">
    <a
      href={href}
      class="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 hover:border-accent/60"
    >
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-foreground/10 font-mono text-xs text-muted"
        aria-hidden="true"
      >
        [shelf]
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-mono text-sm font-semibold">{labelSet.link}</div>
        <div class="truncate text-xs text-muted">
          {labelSet.subtitle(counts.total, counts.reading)}
        </div>
      </div>
      <span class="font-mono text-xs text-accent">→</span>
    </a>

    <div class="max-h-[18rem] overflow-auto">
      <Bookshelf client:visible />
    </div>
  </div>
</BentoCard>
```

- [ ] **Step 3: Remove obsolete entries from `src/data/about.ts`**

Open `src/data/about.ts` and:

1. Delete the `Book` type at lines 1–6:

```ts
export type Book = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};
```

2. Delete the `BOOKS` array (was at lines 58–113 before edits). After step 1 it begins at the line `export const BOOKS: Book[] = [` and ends at its closing `];`.

3. Delete the `GOODREADS_URL` constant (was the last line of the file before edits):

```ts
export const GOODREADS_URL = "https://www.goodreads.com/review/list/181219238";
```

After these removals, no other file in the repo should reference `Book`, `BOOKS`, or `GOODREADS_URL` from `@/data/about` — Task 9 Step 1 removed the only `BOOKS` consumer, and `BookshelfCard.astro` no longer references `GOODREADS_URL`.

- [ ] **Step 4: Verify no stale references remain**

Run: `grep -rn "from \"@/data/about\"" src | grep -E "(Book|GOODREADS)"`
Expected: no output (no remaining importers of the deleted exports).

Run: `grep -rn "GOODREADS_URL" src`
Expected: no output.

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 5: Manual visual check**

Run: `npx astro dev`
- Open `http://localhost:4321/en/about` — the BookshelfCard now shows the `[shelf]` chip, `browse full shelf →`, and the count subtitle (`3 books · 0 reading`). The ASCII preview underneath still renders the three Roberts.
- Click the link — navigates to `/en/bookshelf`.
- Repeat for `/pt/about` and `/ja/about` — link labels and subtitles are localized; the link points at `/pt/bookshelf` and `/ja/bookshelf` respectively.

- [ ] **Step 6: Commit**

```bash
git add src/components/about/BookshelfCard.astro src/components/about/Bookshelf.tsx src/data/about.ts
git commit -m "feat(about): point BookshelfCard at internal /bookshelf, drop GOODREADS_URL"
```

---

### Task 10: Final build + end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npx astro check && npx astro build`
Expected: zero errors, build succeeds.

- [ ] **Step 2: End-to-end manual walkthrough**

Run: `npx astro dev`

Check each acceptance point from the spec's §Verification section:

1. `/en/bookshelf`, `/pt/bookshelf`, `/ja/bookshelf` render with their localized chrome and review/theme text.
2. Hover a spine: book rotates forward and lifts.
3. Tab navigates to each book and the sort control; Enter activates lift and modal.
4. Click a book: modal opens with localized chrome. Backdrop click, Esc, and × all close. Focus returns to the book.
5. Sort A–Z / by theme / by rating each produces the expected layout. Star bars appear only in rating mode. Current-reading stripe shows when applicable (no books currently have `status: "reading"` in seed data — manually flip one in `src/data/books.ts` to confirm, then revert).
6. DevTools `prefers-reduced-motion: reduce`: shelf flattens, no 3D, modal still works.
7. Mobile viewport (`<768px`): sizes scale down; tap-once-to-lift, tap-twice-to-open behavior works.
8. About-card link: `[shelf]` chip, count subtitle, link navigates to the correct locale's bookshelf.
9. `/bookshelf` 301-redirects to `/en/bookshelf` (check Network tab status code).

- [ ] **Step 3: Final commit (only if anything was tweaked in Step 2)**

If no changes, skip. Otherwise:

```bash
git add -A
git commit -m "fix(bookshelf): minor adjustments from end-to-end verification"
```

---

## Open follow-ups

**Intentionally deferred from the agreed design** (call these out at PR review):

- **Sibling-nudge animation on hover** (spec §3D animation). The lift-and-rotate already reads well on its own; the nudge requires a row-level React context with a refs list of all sibling books in the row plus a coordinating GSAP timeline. This is an isolated extension on top of Task 5 — implement it in a follow-up by (a) creating a `BookshelfRow` component that owns a `useRef<Map<string, HTMLDivElement>>`, (b) exposing a context with a `requestNudge(slug: string, direction: -1 | 1)` callback that animates `x: ±6` on siblings within ±2 indices of the hovered book, (c) wiring `Book` to call this on hover/leave.

**Naturally out of scope (would be follow-up work in any case):**

- Replace `cover: null` placeholders with real cover JPGs in `src/assets/books/`.
- Author additional book entries — each new entry is one append to `BOOKS` in `src/data/books.ts` plus one image file.
- Per-book deep links (`/bookshelf/<slug>`) if/when shareable URLs become useful.
