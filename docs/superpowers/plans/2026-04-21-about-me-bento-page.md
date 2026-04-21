# About Me Bento Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `/en/about` bento-dashboard About page per [2026-04-21-about-me-bento-page-design.md](../specs/2026-04-21-about-me-bento-page-design.md).

**Architecture:** Single Astro page at `src/pages/en/about.astro` composed of a CLI-styled hero plus a 10-card bento grid. Cards are server-rendered Astro components sharing a `BentoCard.astro` shell. Three React islands handle interactivity (typewriter, bookshelf hover quotes, Konami cat). Content data lives in `src/data/about.ts`.

**Tech Stack:** Astro 5, React 19, TypeScript, Tailwind CSS 4, `flag-icons` (new dep).

**Verification strategy:** This project has no test runner. Each task ends with `bun run astro check` for types and, where visual work is introduced, a manual dev-server check. Commits are made after each task.

---

## File Map

**New files:**
- `src/data/about.ts` — all page content (books, languages, games, etc.)
- `src/components/about/BentoCard.astro` — card shell with prompt header slot
- `src/components/about/AboutHeroTerminal.tsx` — typewriter React island
- `src/components/about/Bookshelf.tsx` — ASCII book covers with hover quotes
- `src/components/about/KonamiCat.tsx` — `c`→`a`→`t` keystroke listener
- `src/components/about/GamesCard.astro`
- `src/components/about/MusicCard.astro`
- `src/components/about/AnimeCard.astro`
- `src/components/about/ObsessionsCard.astro`
- `src/components/about/LanguagesCard.astro`
- `src/components/about/PassportCard.astro`
- `src/components/about/JoysCard.astro`
- `src/components/about/IdentityCard.astro`
- `src/components/about/LearningCard.astro`
- `src/pages/en/about.astro` — page layout
- `src/pages/about.astro` — root-level redirect to `/en/about`
- `src/assets/gifs/about/` — GIF assets directory (populated during Task 7)

**Modified files:**
- `package.json` — add `flag-icons` dependency
- `src/components/Header.astro` — add "About" nav link and `/about` in `knownPaths`

---

## Task 1: Install dependencies and create data file

**Files:**
- Modify: `package.json`
- Create: `src/data/about.ts`

- [ ] **Step 1: Install `flag-icons`**

Run:
```bash
bun add flag-icons
```

Expected: package added to `dependencies` in `package.json`.

- [ ] **Step 2: Create the data file**

Create `src/data/about.ts`:

```ts
export type Book = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};

export type LanguageRow = {
  code: string;
  name: string;
  level: "fluent" | "intermediate" | "queued";
  greeting: string;
};

export type PinnedGame = {
  title: string;
  comment: string;
};

export type Anime = {
  title: string;
  tagline: string;
};

export type Joy = {
  label: string;
  gifPath: string;
  alt: string;
};

export const BOOKS: Book[] = [
  {
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    quote: "Your task as a student of human nature is to transform yourself into a calm and patient observer.",
    asciiCover: [
      " _________________ ",
      "|  _____________  |",
      "| |             | |",
      "| |  THE LAWS   | |",
      "| |     OF      | |",
      "| |    HUMAN    | |",
      "| |   NATURE    | |",
      "| |             | |",
      "| |  R. GREENE  | |",
      "| |_____________| |",
      "|_________________|",
    ].join("\n"),
  },
  {
    title: "The King in Yellow",
    author: "Robert W. Chambers",
    quote: "Strange is the night where black stars rise.",
    asciiCover: [
      " _________________ ",
      "|  _____________  |",
      "| |             | |",
      "| |   THE KING  | |",
      "| |     IN      | |",
      "| |   YELLOW    | |",
      "| |             | |",
      "| |             | |",
      "| |  CHAMBERS   | |",
      "| |_____________| |",
      "|_________________|",
    ].join("\n"),
  },
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    quote: "Don't Panic.",
    asciiCover: [
      " _________________ ",
      "|  _____________  |",
      "| |             | |",
      "| |   DON'T     | |",
      "| |   PANIC     | |",
      "| |             | |",
      "| |   HGTTG     | |",
      "| |             | |",
      "| |  D. ADAMS   | |",
      "| |_____________| |",
      "|_________________|",
    ].join("\n"),
  },
];

export const LANGUAGES: LanguageRow[] = [
  { code: "pt", name: "Portuguese", level: "fluent", greeting: "Olá" },
  { code: "en", name: "English", level: "fluent", greeting: "Hello" },
  { code: "es", name: "Spanish", level: "fluent", greeting: "Hola" },
  { code: "ja", name: "Japanese", level: "intermediate", greeting: "こんにちは" },
  { code: "ru", name: "Russian", level: "queued", greeting: "Привет" },
  { code: "zh", name: "Chinese", level: "queued", greeting: "你好" },
  { code: "de", name: "German", level: "queued", greeting: "Hallo" },
];

export const PINNED_GAMES: PinnedGame[] = [
  { title: "Hollow Knight", comment: "every corner of Hallownest deserves a moment of silence." },
  { title: "NieR: Automata", comment: "makes you feel things about androids and the end of the world." },
  { title: "League of Legends", comment: "I know, I know. It's the cats of video games." },
];

export const ANIME: Anime[] = [
  { title: "Fullmetal Alchemist", tagline: "equivalent exchange, emotional devastation." },
  { title: "Steins;Gate", tagline: "el psy kongroo." },
  { title: "Bakemonogatari", tagline: "dialogue as architecture." },
];

export const OBSESSIONS: string[] = [
  "philosophy",
  "neuroscience",
  "mathematics",
  "coding",
  "ascii art",
];

export const STAMPED_COUNTRIES: { code: string; name: string }[] = [
  { code: "br", name: "Brazil" },
  { code: "pa", name: "Panama" },
  { code: "us", name: "United States" },
  { code: "co", name: "Colombia" },
  { code: "qa", name: "Qatar" },
  { code: "jp", name: "Japan" },
  { code: "au", name: "Australia" },
  { code: "cl", name: "Chile" },
  { code: "ar", name: "Argentina" },
  { code: "de", name: "Germany" },
];

export const NEXT_UP_COUNTRY_COUNT = 4;

export const JOYS: Joy[] = [
  { label: "cats", gifPath: "/gifs/about/joys/cats.gif", alt: "A cat looping gently." },
  { label: "ice cream", gifPath: "/gifs/about/joys/ice-cream.gif", alt: "An animated ice cream." },
  { label: "cheese", gifPath: "/gifs/about/joys/cheese.gif", alt: "Cheese, animated." },
  { label: "coffee", gifPath: "/gifs/about/joys/coffee.gif", alt: "A steaming coffee cup." },
  { label: "beer", gifPath: "/gifs/about/joys/beer.gif", alt: "A foaming beer mug." },
  { label: "silly", gifPath: "/gifs/about/joys/silly.gif", alt: "Something goofy happening." },
];

export const IDENTITY = {
  mbti: "INTJ",
  tritype: "1-4-5",
  core: "truth / energy / love",
};

export const LEARNING: { name: string; percent: number }[] = [
  { name: "styling", percent: 60 },
  { name: "crochet", percent: 10 },
];

export const SPOTIFY_PLAYLIST_ID = "5X9BtccLFJs3ophR6tL5br";

export const STEAM_PROFILE_URL = "https://steamcommunity.com/id/pekkimori/";
```

- [ ] **Step 3: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors related to the new file.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock src/data/about.ts
git commit -m "feat(about): add flag-icons dep and about page data"
```

---

## Task 2: BentoCard shell component

**Files:**
- Create: `src/components/about/BentoCard.astro`

- [ ] **Step 1: Create the shell**

Create `src/components/about/BentoCard.astro`:

```astro
---
type Props = {
  prompt: string;
  class?: string;
};

const { prompt, class: className = "" } = Astro.props;
---

<article
  class:list={[
    "flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-5",
    "transition-colors hover:border-accent/60",
    className,
  ]}
>
  <header class="font-mono text-xs uppercase tracking-wider text-accent">
    {prompt}
  </header>
  <div class="flex-1">
    <slot />
  </div>
</article>
```

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/BentoCard.astro
git commit -m "feat(about): add BentoCard shell component"
```

---

## Task 3: Simple text cards (Obsessions, Identity, Learning)

**Files:**
- Create: `src/components/about/ObsessionsCard.astro`
- Create: `src/components/about/IdentityCard.astro`
- Create: `src/components/about/LearningCard.astro`

- [ ] **Step 1: ObsessionsCard**

Create `src/components/about/ObsessionsCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { OBSESSIONS } from "@/data/about";
---

<BentoCard prompt="$ tags">
  <ul class="flex flex-wrap gap-2">
    {
      OBSESSIONS.map(tag => (
        <li class="rounded-full border border-border px-3 py-1 font-mono text-sm">
          {tag}
        </li>
      ))
    }
  </ul>
</BentoCard>
```

- [ ] **Step 2: IdentityCard**

Create `src/components/about/IdentityCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { IDENTITY } from "@/data/about";
---

<BentoCard prompt="$ stat rafael">
  <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
    <dt class="text-muted">MBTI</dt>
    <dd>{IDENTITY.mbti}</dd>
    <dt class="text-muted">TRITYPE</dt>
    <dd>{IDENTITY.tritype}</dd>
    <dt class="text-muted">CORE</dt>
    <dd>{IDENTITY.core}</dd>
  </dl>
</BentoCard>
```

- [ ] **Step 3: LearningCard**

Create `src/components/about/LearningCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { LEARNING } from "@/data/about";

const BAR_CELLS = 10;
function bar(percent: number) {
  const filled = Math.round((percent / 100) * BAR_CELLS);
  return "█".repeat(filled) + "░".repeat(BAR_CELLS - filled);
}
---

<BentoCard prompt="$ crontab learning">
  <ul class="space-y-2 font-mono text-sm">
    {
      LEARNING.map(item => (
        <li class="flex items-center justify-between gap-4">
          <span class="w-24 shrink-0">{item.name}</span>
          <span class="text-accent">[{bar(item.percent)}]</span>
          <span class="w-10 shrink-0 text-right text-muted">{item.percent}%</span>
        </li>
      ))
    }
  </ul>
</BentoCard>
```

- [ ] **Step 4: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/about/ObsessionsCard.astro src/components/about/IdentityCard.astro src/components/about/LearningCard.astro
git commit -m "feat(about): add obsessions, identity, learning cards"
```

---

## Task 4: AnimeCard

**Files:**
- Create: `src/components/about/AnimeCard.astro`

- [ ] **Step 1: Create the component**

Create `src/components/about/AnimeCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { ANIME } from "@/data/about";
---

<BentoCard prompt="$ cat ~/anime/favorites.txt">
  <ul class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {
      ANIME.map(item => (
        <li
          class:list={[
            "group rounded-xl border border-border bg-background/40 p-3",
            "transition-transform hover:-translate-y-1 hover:scale-[1.03]",
            "motion-reduce:transform-none motion-reduce:transition-none",
          ]}
        >
          <h3 class="font-mono text-sm font-semibold">{item.title}</h3>
          <p class="mt-1 text-xs italic text-muted">
            {item.tagline}
          </p>
        </li>
      ))
    }
  </ul>
</BentoCard>
```

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/AnimeCard.astro
git commit -m "feat(about): add anime card"
```

---

## Task 5: LanguagesCard with progress bars

**Files:**
- Create: `src/components/about/LanguagesCard.astro`

- [ ] **Step 1: Create the component**

Create `src/components/about/LanguagesCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { LANGUAGES } from "@/data/about";

const BAR_CELLS = 12;
const LEVEL_FILL: Record<string, number> = {
  fluent: 12,
  intermediate: 7,
  queued: 0,
};

function bar(level: string) {
  const filled = LEVEL_FILL[level] ?? 0;
  return "█".repeat(filled) + "░".repeat(BAR_CELLS - filled);
}
---

<BentoCard prompt="$ polyglot --status">
  <ul class="space-y-1 font-mono text-sm">
    {
      LANGUAGES.map(row => (
        <li
          class:list={[
            "group relative flex items-center gap-3",
            "rounded px-1 transition-colors hover:bg-foreground/5",
          ]}
        >
          <span class="w-8 shrink-0 uppercase text-muted">{row.code}</span>
          <span class="text-accent">[{bar(row.level)}]</span>
          <span class="w-28 shrink-0 text-xs text-muted">{row.level}</span>
          <span
            class:list={[
              "pointer-events-none ml-auto text-xs italic opacity-0 transition-opacity",
              "group-hover:opacity-100",
            ]}
            aria-hidden="true"
          >
            {row.greeting}
          </span>
        </li>
      ))
    }
  </ul>
</BentoCard>
```

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/LanguagesCard.astro
git commit -m "feat(about): add languages card with progress bars"
```

---

## Task 6: PassportCard with SVG flags

**Files:**
- Create: `src/components/about/PassportCard.astro`

- [ ] **Step 1: Import flag-icons CSS in the card**

Create `src/components/about/PassportCard.astro`:

```astro
---
import "flag-icons/css/flag-icons.min.css";
import BentoCard from "./BentoCard.astro";
import { STAMPED_COUNTRIES, NEXT_UP_COUNTRY_COUNT } from "@/data/about";

const nextUpSlots = Array.from({ length: NEXT_UP_COUNTRY_COUNT });
---

<BentoCard prompt="$ ls ~/passport/stamps">
  <div class="space-y-3">
    <section>
      <h3 class="mb-2 font-mono text-xs uppercase text-muted">stamped</h3>
      <ul class="flex flex-wrap gap-2">
        {
          STAMPED_COUNTRIES.map(c => (
            <li class="group relative">
              <span
                class={`fi fi-${c.code} block h-6 w-9 rounded-sm border border-border/60 shadow-sm transition-transform group-hover:scale-110 motion-reduce:transform-none`}
                aria-label={c.name}
                role="img"
              />
              <span class="sr-only">{c.name}</span>
              <span
                class:list={[
                  "pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap",
                  "rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background opacity-0 shadow",
                  "transition-opacity group-hover:opacity-100",
                ]}
                aria-hidden="true"
              >
                {c.name}
              </span>
            </li>
          ))
        }
      </ul>
    </section>

    <section>
      <h3 class="mb-2 font-mono text-xs uppercase text-muted">next up</h3>
      <ul class="flex flex-wrap gap-2">
        {
          nextUpSlots.map(() => (
            <li
              class="flex h-6 w-9 items-center justify-center rounded-sm border border-dashed border-border/80 font-mono text-xs text-muted"
              aria-hidden="true"
            >
              ?
            </li>
          ))
        }
      </ul>
    </section>
  </div>
</BentoCard>
```

- [ ] **Step 2: Type check and build**

Run:
```bash
bun run astro check
```

Expected: no errors. (The `flag-icons` CSS import is a side-effect import, no types needed.)

- [ ] **Step 3: Commit**

```bash
git add src/components/about/PassportCard.astro
git commit -m "feat(about): add passport card with SVG flags"
```

---

## Task 7: JoysCard + GIF assets

**Files:**
- Create: `src/assets/gifs/about/joys/` (six gif files)
- Create: `src/components/about/JoysCard.astro`

Note: The `JOYS` data in `src/data/about.ts` references GIF paths under `/gifs/about/joys/`. Astro serves `public/` at the site root, so GIFs go into `public/gifs/about/joys/`. Update the data file if the path differs.

- [ ] **Step 1: Add GIF assets**

Create directory `public/gifs/about/joys/` and place six GIFs named exactly:
- `cats.gif`
- `ice-cream.gif`
- `cheese.gif`
- `coffee.gif`
- `beer.gif`
- `silly.gif`

Each should be ≤200KB. If you (the implementer) don't have curated GIFs ready, use tasteful loops from https://giphy.com or https://tenor.com. Pick ones that read well at 80px and tile cleanly on both light and dark backgrounds.

- [ ] **Step 2: Create JoysCard**

Create `src/components/about/JoysCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { JOYS } from "@/data/about";
---

<BentoCard prompt="$ ls ~/joys">
  <ul class="grid grid-cols-3 gap-2">
    {
      JOYS.map(joy => (
        <li class="flex flex-col items-center gap-1">
          <img
            src={joy.gifPath}
            alt={joy.alt}
            loading="lazy"
            decoding="async"
            class:list={[
              "h-16 w-16 rounded-lg object-cover grayscale",
              "transition-[filter] duration-500 hover:grayscale-0",
              "motion-reduce:transition-none motion-reduce:grayscale-0",
            ]}
          />
          <span class="font-mono text-[11px] text-muted">{joy.label}</span>
        </li>
      ))
    }
  </ul>
</BentoCard>
```

- [ ] **Step 3: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add public/gifs/about/joys src/components/about/JoysCard.astro
git commit -m "feat(about): add joys card and joy GIFs"
```

---

## Task 8: MusicCard with Spotify embed

**Files:**
- Create: `src/components/about/MusicCard.astro`

- [ ] **Step 1: Create the component**

Create `src/components/about/MusicCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { SPOTIFY_PLAYLIST_ID } from "@/data/about";
const src = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`;
---

<BentoCard prompt="$ spotify --playlist">
  <iframe
    title="Rafael's Spotify playlist"
    src={src}
    width="100%"
    height="152"
    frameborder="0"
    allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy"
    class="rounded-xl"
  ></iframe>
</BentoCard>
```

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/MusicCard.astro
git commit -m "feat(about): add music card with Spotify embed"
```

---

## Task 9: GamesCard (static Steam block + pinned favorites)

**Files:**
- Create: `src/components/about/GamesCard.astro`

Per the spec's "Steam embed" note, we default to static Steam content (profile link + avatar placeholder) rather than a third-party iframe. The avatar is a simple styled block; the implementer can later swap in the actual profile image by saving it to `public/gifs/about/steam-avatar.jpg` and updating the src.

- [ ] **Step 1: Create the component**

Create `src/components/about/GamesCard.astro`:

```astro
---
import BentoCard from "./BentoCard.astro";
import { PINNED_GAMES, STEAM_PROFILE_URL } from "@/data/about";
---

<BentoCard prompt="$ steam --now-playing">
  <div class="flex flex-col gap-4">
    <a
      href={STEAM_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-accent/60"
    >
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-foreground/10 font-mono text-xs text-muted"
        aria-hidden="true"
      >
        [PKM]
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-mono text-sm font-semibold">pekkimori</div>
        <div class="truncate text-xs text-muted">
          steamcommunity.com/id/pekkimori
        </div>
      </div>
      <span class="font-mono text-xs text-accent">→</span>
    </a>

    <ul class="space-y-2">
      {
        PINNED_GAMES.map(game => (
          <li class="rounded-lg border border-border/60 p-2">
            <div class="text-sm font-semibold">{game.title}</div>
            <div class="font-mono text-xs text-muted">{game.comment}</div>
          </li>
        ))
      }
    </ul>
  </div>
</BentoCard>
```

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/GamesCard.astro
git commit -m "feat(about): add games card with Steam link and pinned favorites"
```

---

## Task 10: Bookshelf React island

**Files:**
- Create: `src/components/about/Bookshelf.tsx`

This is interactive (hover/tap to reveal quote), so it's a React island.

- [ ] **Step 1: Create the component**

Create `src/components/about/Bookshelf.tsx`:

```tsx
import { useState } from "react";
import { BOOKS } from "@/data/about";

export default function Bookshelf() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {BOOKS.map((book, i) => {
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
        className="font-mono text-[10px] leading-none text-border"
      >
        {"=".repeat(40)}
      </div>

      <div className="min-h-[3rem] text-center">
        {activeIndex !== null ? (
          <figure>
            <blockquote className="font-mono text-sm italic">
              "{BOOKS[activeIndex].quote}"
            </blockquote>
            <figcaption className="mt-1 font-mono text-xs text-muted">
              — {BOOKS[activeIndex].title}, {BOOKS[activeIndex].author}
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

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/Bookshelf.tsx
git commit -m "feat(about): add Bookshelf React island with ASCII covers"
```

---

## Task 11: AboutHeroTerminal React island

**Files:**
- Create: `src/components/about/AboutHeroTerminal.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/about/AboutHeroTerminal.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";

const LINES: { text: string; pauseAfterMs?: number }[] = [
  { text: "$ whoami" },
  { text: "> rafael mori" },
  { text: "> polymath · INTJ 145 · truth · energy · love", pauseAfterMs: 400 },
  { text: "" },
  { text: "$ cat ~/intro.md" },
  { text: "> building systems, exploring brains," },
  { text: "> collecting countries, ranking cheeses.", pauseAfterMs: 300 },
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
    <div className="overflow-hidden rounded-xl border border-border bg-background/80 shadow-sm">
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
```

- [ ] **Step 2: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/AboutHeroTerminal.tsx
git commit -m "feat(about): add hero terminal with typewriter animation"
```

---

## Task 12: KonamiCat React island

**Files:**
- Create: `src/components/about/KonamiCat.tsx`

- [ ] **Step 1: Add the Konami cat GIF to public assets**

Place a horizontally-tileable cat-walking GIF at `public/gifs/about/konami-cat.gif`. Size ≤300KB.

- [ ] **Step 2: Create the component**

Create `src/components/about/KonamiCat.tsx`:

```tsx
import { useEffect, useState } from "react";

const SEQUENCE = ["c", "a", "t"];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function KonamiCat() {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let firedOnce = false;
    let cursor = 0;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (firedOnce) return;

      const key = e.key.toLowerCase();
      if (key === SEQUENCE[cursor]) {
        cursor += 1;
        if (cursor === SEQUENCE.length) {
          firedOnce = true;
          setTriggered(true);
        }
      } else {
        cursor = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!triggered) return null;

  return (
    <img
      src="/gifs/about/konami-cat.gif"
      alt=""
      aria-hidden="true"
      onAnimationEnd={() => setTriggered(false)}
      className="pointer-events-none fixed bottom-4 left-0 z-50 h-24 w-24 animate-[konami-walk_6s_linear_forwards]"
      style={{
        ["--konami-end" as string]: "calc(100vw + 10rem)",
      }}
    />
  );
}
```

- [ ] **Step 3: Add the keyframes to global CSS**

Open `src/styles/global.css` and append:

```css
@keyframes konami-walk {
  from {
    transform: translateX(-10rem);
  }
  to {
    transform: translateX(var(--konami-end, 100vw));
  }
}
```

- [ ] **Step 4: Type check**

Run:
```bash
bun run astro check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/about/KonamiCat.tsx src/styles/global.css public/gifs/about/konami-cat.gif
git commit -m "feat(about): add Konami cat keystroke easter egg"
```

---

## Task 13: Assemble the page

**Files:**
- Create: `src/pages/en/about.astro`

- [ ] **Step 1: Place the hero cat GIF**

Place a looping cat GIF at `public/gifs/about/hero-cat.gif`. Target ≤250KB.

- [ ] **Step 2: Create the page**

Create `src/pages/en/about.astro`:

```astro
---
import Layout from "@/layouts/Layout.astro";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import Hr from "@/components/Hr.astro";
import AboutHeroTerminal from "@/components/about/AboutHeroTerminal";
import Bookshelf from "@/components/about/Bookshelf";
import KonamiCat from "@/components/about/KonamiCat";
import BentoCard from "@/components/about/BentoCard.astro";
import GamesCard from "@/components/about/GamesCard.astro";
import MusicCard from "@/components/about/MusicCard.astro";
import AnimeCard from "@/components/about/AnimeCard.astro";
import ObsessionsCard from "@/components/about/ObsessionsCard.astro";
import LanguagesCard from "@/components/about/LanguagesCard.astro";
import PassportCard from "@/components/about/PassportCard.astro";
import JoysCard from "@/components/about/JoysCard.astro";
import IdentityCard from "@/components/about/IdentityCard.astro";
import LearningCard from "@/components/about/LearningCard.astro";

const buildDate = new Date().toISOString().slice(0, 10);
---

<Layout lang="en">
  <Header />
  <main id="main-content" data-layout="about">
    <section id="hero" class="pt-8 pb-6">
      <div class="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
        <AboutHeroTerminal client:load />
        <img
          src="/gifs/about/hero-cat.gif"
          alt="A contentedly looping cat."
          class="hidden h-60 w-60 rounded-xl object-cover md:block"
          loading="eager"
          decoding="async"
        />
      </div>
    </section>

    <Hr />

    <section id="bento" class="pt-8 pb-10">
      <div
        class="grid auto-rows-[minmax(12rem,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div class="sm:col-span-2 xl:col-span-2 xl:row-span-2">
          <GamesCard />
        </div>

        <div class="sm:col-span-2 xl:col-span-2">
          <MusicCard />
        </div>

        <div class="sm:col-span-2 xl:col-span-2 xl:row-span-2">
          <BentoCard prompt="$ ls ~/bookshelf">
            <Bookshelf client:visible />
          </BentoCard>
        </div>

        <div class="sm:col-span-2 xl:col-span-2">
          <AnimeCard />
        </div>

        <div>
          <ObsessionsCard />
        </div>

        <div class="sm:col-span-2 xl:col-span-2">
          <LanguagesCard />
        </div>

        <div class="sm:col-span-2 xl:col-span-2">
          <PassportCard />
        </div>

        <div>
          <JoysCard />
        </div>

        <div>
          <IdentityCard />
        </div>

        <div>
          <LearningCard />
        </div>
      </div>
    </section>

    <footer class="mt-8 border-t border-border pt-4 pb-10">
      <p class="font-mono text-xs text-muted">
        &gt; status: * caffeinated * — last updated: {buildDate}
      </p>
    </footer>

    <KonamiCat client:idle />
  </main>
  <Footer />
</Layout>

<script>
  document.addEventListener("astro:page-load", () => {
    const layout = (document.querySelector("#main-content") as HTMLElement)
      ?.dataset?.layout;
    if (layout === "about") {
      sessionStorage.setItem("backUrl", "/en/about");
    }
  });
</script>
```

- [ ] **Step 3: Run dev server and visually verify**

Run:
```bash
bun run dev
```

Navigate to `http://localhost:4321/en/about`. Verify:
- Terminal types out in the hero.
- All 10 cards render without layout overflow.
- Bookshelf reveals a quote on hover.
- Language rows reveal greetings on hover.
- Flag hover shows country name tooltip.
- Joys go from grayscale to color on hover.
- Typing `cat` anywhere triggers the Konami cat walking once.
- Mobile layout (DevTools responsive): cards stack to single column, cat GIF hides on mobile hero.

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Type check and build**

Run:
```bash
bun run astro check && bun run astro build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/en/about.astro public/gifs/about/hero-cat.gif
git commit -m "feat(about): assemble About Me page at /en/about"
```

---

## Task 14: Root-level redirect

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create the redirect**

Create `src/pages/about.astro`:

```astro
---
return Astro.redirect("/en/about", 301);
---
```

- [ ] **Step 2: Verify**

Run:
```bash
bun run dev
```

Navigate to `http://localhost:4321/about`. Verify it redirects to `/en/about`.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(about): add /about root redirect to /en/about"
```

---

## Task 15: Header nav update

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Update `knownPaths`**

In `src/components/Header.astro`, find the line:

```astro
const knownPaths = ["/", "/posts", "/tags", "/portfolio", "/search"];
```

Replace with:

```astro
const knownPaths = ["/", "/posts", "/tags", "/portfolio", "/about", "/search"];
```

- [ ] **Step 2: Add "about" to the `navLabels` object**

In `src/components/Header.astro`, find:

```astro
const navLabels = isPt
  ? { posts: "Posts", tags: "Tags", projects: "Portfólio", search: "Buscar" }
  : isJa
    ? { posts: "投稿", tags: "タグ", projects: "ポートフォリオ", search: "検索" }
    : { posts: "Posts", tags: "Tags", projects: "Portfolio", search: "Search" };
```

Replace with:

```astro
const navLabels = isPt
  ? { posts: "Posts", tags: "Tags", projects: "Portfólio", about: "Sobre", search: "Buscar" }
  : isJa
    ? { posts: "投稿", tags: "タグ", projects: "ポートフォリオ", about: "自己紹介", search: "検索" }
    : { posts: "Posts", tags: "Tags", projects: "Portfolio", about: "About", search: "Search" };
```

- [ ] **Step 3: Add the nav link between Portfolio and Search**

In `src/components/Header.astro`, find the Portfolio `<li>`:

```astro
          <li class="w-full">
            <a
              href={`${base}/portfolio`}
              class:list={{ "active-nav": isActive("/portfolio") }}
            >
              {navLabels.projects}
            </a>
          </li>
```

Insert this new `<li>` immediately after it:

```astro
          <li class="w-full">
            <a
              href={`${base}/about`}
              class:list={{ "active-nav": isActive("/about") }}
            >
              {navLabels.about}
            </a>
          </li>
```

- [ ] **Step 4: Run dev server and verify**

Run:
```bash
bun run dev
```

Verify:
- "About" nav link appears between Portfolio and Search (English).
- Clicking it navigates to `/en/about`.
- Highlighting works: the link is active when on `/en/about`.
- Language switcher on `/en/about` falls back to `/pt/posts` and `/ja/posts` (since pt/ja about pages don't exist).

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(about): add About to nav"
```

---

## Task 16: Final verification

- [ ] **Step 1: Full build**

Run:
```bash
bun run build
```

Expected: `astro check` passes, `astro build` completes successfully, pagefind indexes the site.

- [ ] **Step 2: Preview the built site**

Run:
```bash
bun run preview
```

Navigate to:
- `/en/about` — full page renders, no console errors.
- `/about` — redirects to `/en/about`.
- `/en/portfolio` — still works (no regressions).
- `/en/` — still works.

Stop the preview server.

- [ ] **Step 3: Lint and format**

Run:
```bash
bun run lint
bun run format:check
```

If `format:check` fails, run `bun run format` and review the diff before committing.

- [ ] **Step 4: Final commit (if formatting changed anything)**

```bash
git add -A
git diff --cached --quiet || git commit -m "chore(about): prettier pass"
```

---

## Done

The About page is live at `/en/about`, linked from the nav, with all 10 bento cards, terminal hero, Bookshelf hover quotes, and the Konami cat easter egg.
