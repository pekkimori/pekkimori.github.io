# About Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/en/about` into a hybrid (terminal-chrome + modern structured cards) layout with a featured "Now" card and 6 uniform archive cards, fixing content overflow.

**Architecture:** Extend `src/data/about.ts` with new typed constants (`NOW`, `MUSIC_TASTE`, `ATLAS`, reshaped `IDENTITY`). Add one `ProgressBar` utility component. Create `NowCard` and `AtlasCard`, rewrite `MusicCard` and `IdentityCard`. Rewire `src/pages/en/about.astro` to the new grid and delete obsolete card files (`ObsessionsCard`, `JoysCard`, `LearningCard`, `PassportCard`, `LanguagesCard`).

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4, React (existing islands only). Package manager: `pnpm`.

**Note on testing:** This is a static-site visual redesign. There is no unit test framework wired up in this repo. The gating "tests" are (a) `pnpm astro check` for type/template errors, (b) `pnpm build` for full build correctness, and (c) manual browser verification at `sm` / `md` / `lg` widths via `pnpm dev`. Each task ends with whichever of these is appropriate for the change.

**Spec:** `docs/superpowers/specs/2026-04-21-about-page-redesign-design.md`

---

## File Structure

**Created:**
- `src/components/about/ProgressBar.astro` — renders `▓▓▓▓░` given `value` + `max`.
- `src/components/about/NowCard.astro` — featured full-width card, 4 tiles.
- `src/components/about/AtlasCard.astro` — merges languages + places with tab toggle.
- `src/components/about/AtlasTabs.tsx` — small React client island for the Languages/Places toggle.

**Rewritten:**
- `src/components/about/MusicCard.astro` — 3 labeled rows from `MUSIC_TASTE` (replaces Spotify iframe).
- `src/components/about/IdentityCard.astro` — one-liner + value pills + clamped prose.
- `src/data/about.ts` — add `NOW`, `MUSIC_TASTE`, `ATLAS`; reshape `IDENTITY`; remove unused `OBSESSIONS`, `JOYS`, `LEARNING`, `STAMPED_COUNTRIES`, `NEXT_UP_COUNTRY_COUNT`, `LANGUAGES`, `SPOTIFY_PLAYLIST_ID`, `Joy` type, `LanguageRow` type.
- `src/pages/en/about.astro` — new section structure.

**Deleted:**
- `src/components/about/ObsessionsCard.astro`
- `src/components/about/JoysCard.astro`
- `src/components/about/LearningCard.astro`
- `src/components/about/PassportCard.astro`
- `src/components/about/LanguagesCard.astro`

**Unchanged:**
- `src/components/about/BentoCard.astro`
- `src/components/about/GamesCard.astro`
- `src/components/about/AnimeCard.astro`
- `src/components/about/Bookshelf.tsx`
- `src/components/about/AboutHeroTerminal.tsx`
- `src/components/about/KonamiCat.tsx`

---

## Task 1: Extend data model

**Files:**
- Modify: `src/data/about.ts`

- [ ] **Step 1: Replace the file contents with the new data shape**

Replace the full file with:

```ts
export type Book = {
  title: string;
  author: string;
  quote: string;
  asciiCover: string;
};

export type PinnedGame = {
  title: string;
  comment: string;
};

export type Anime = {
  title: string;
  tagline: string;
};

export type NowEntry = {
  title: string;
  meta: string;
  progress?: { value: number; max: number };
};

export type MusicTasteRow = {
  label: "on repeat" | "lately" | "forever";
  value: string;
};

export type AtlasLanguage = {
  code: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4;
};

export type AtlasPlace = {
  code: string;
  city: string;
  note: string;
  kind: "lived" | "visited";
};

export type Identity = {
  oneLiner: string;
  values: string[];
  prose: string;
};

export const BOOKS: Book[] = [
  {
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    quote:
      "Your task as a student of human nature is to transform yourself into a calm and patient observer.",
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

export const NOW: {
  playing: NowEntry;
  reading: NowEntry;
  listening: NowEntry;
  watching: NowEntry;
} = {
  playing: { title: "Hollow Knight", meta: "true ending run", progress: { value: 84, max: 112 } },
  reading: { title: "The Laws of Human Nature", meta: "R. Greene", progress: { value: 142, max: 331 } },
  listening: { title: "liminal lo-fi", meta: "for long coding nights" },
  watching: { title: "Frieren: Beyond Journey's End", meta: "ep 14", progress: { value: 14, max: 28 } },
};

export const MUSIC_TASTE: MusicTasteRow[] = [
  { label: "on repeat", value: "Mitski — Nobody" },
  { label: "lately", value: "boards of canada, cocteau twins, fishmans" },
  { label: "forever", value: "Radiohead, Björk, Nine Inch Nails" },
];

export const ATLAS: {
  languages: AtlasLanguage[];
  places: AtlasPlace[];
} = {
  languages: [
    { code: "pt", name: "Portuguese", level: 4 },
    { code: "en", name: "English", level: 4 },
    { code: "es", name: "Spanish", level: 4 },
    { code: "ja", name: "Japanese", level: 2 },
    { code: "ru", name: "Russian", level: 1 },
    { code: "zh", name: "Chinese", level: 1 },
    { code: "de", name: "German", level: 1 },
  ],
  places: [
    { code: "br", city: "São Paulo", note: "home base", kind: "lived" },
    { code: "pa", city: "Panama City", note: "short stay", kind: "lived" },
    { code: "jp", city: "Tokyo", note: "returns often", kind: "visited" },
    { code: "us", city: "New York", note: "", kind: "visited" },
    { code: "co", city: "Bogotá", note: "", kind: "visited" },
    { code: "qa", city: "Doha", note: "", kind: "visited" },
    { code: "au", city: "Sydney", note: "", kind: "visited" },
    { code: "cl", city: "Santiago", note: "", kind: "visited" },
    { code: "ar", city: "Buenos Aires", note: "", kind: "visited" },
    { code: "de", city: "Berlin", note: "", kind: "visited" },
  ],
};

export const IDENTITY: Identity = {
  oneLiner: "Engineer, linguist, stubborn optimist.",
  values: ["truth", "energy", "love", "craft", "play"],
  prose:
    "I build things that feel like they were made by a person. I read too much, sleep too little, and believe the best software has a sense of humor about itself.",
};

export const STEAM_PROFILE_URL = "https://steamcommunity.com/id/pekkimori/";
```

- [ ] **Step 2: Run the type checker to confirm no consumers broke**

Run: `pnpm astro check`
Expected: errors in the five card files we're about to delete/rewrite (`LanguagesCard`, `PassportCard`, `ObsessionsCard`, `JoysCard`, `LearningCard`, `MusicCard`, `IdentityCard`) referencing removed exports. That is expected — subsequent tasks resolve them.

- [ ] **Step 3: Commit**

```bash
git add src/data/about.ts
git commit -m "refactor(about): reshape data model for redesign"
```

---

## Task 2: Add `ProgressBar.astro` utility

**Files:**
- Create: `src/components/about/ProgressBar.astro`

- [ ] **Step 1: Create the component**

```astro
---
type Props = {
  value: number;
  max: number;
  width?: number; // total cells, default 10
  label?: string;
};
const { value, max, width = 10, label } = Astro.props;
const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
const filled = Math.round(ratio * width);
const empty = width - filled;
---

<div class="font-mono text-[11px] leading-none">
  <span class="text-accent">{"▓".repeat(filled)}</span><span class="text-muted">{"░".repeat(empty)}</span>
  {label && <span class="ml-2 text-muted">{label}</span>}
</div>
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm astro check`
Expected: no new errors from this file (pre-existing errors from Task 1's dangling consumers still present).

- [ ] **Step 3: Commit**

```bash
git add src/components/about/ProgressBar.astro
git commit -m "feat(about): add ProgressBar utility"
```

---

## Task 3: Create `NowCard.astro`

**Files:**
- Create: `src/components/about/NowCard.astro`

- [ ] **Step 1: Create the component**

```astro
---
import BentoCard from "./BentoCard.astro";
import ProgressBar from "./ProgressBar.astro";
import { NOW } from "@/data/about";

const tiles: { key: string; label: string; entry: typeof NOW.playing }[] = [
  { key: "playing", label: "playing", entry: NOW.playing },
  { key: "reading", label: "reading", entry: NOW.reading },
  { key: "listening", label: "listening", entry: NOW.listening },
  { key: "watching", label: "watching", entry: NOW.watching },
];
---

<BentoCard prompt="$ now --live">
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
    {
      tiles.map(({ key, label, entry }) => (
        <div
          class="flex min-h-[6.5rem] flex-col justify-between rounded-xl border border-border/60 bg-background/40 p-3"
          data-now-tile={key}
        >
          <div class="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            {label}
          </div>
          <div class="mt-1 text-sm font-semibold text-foreground line-clamp-2">
            {entry.title}
          </div>
          <div class="font-mono text-[11px] text-muted line-clamp-1">{entry.meta}</div>
          {entry.progress && (
            <div class="mt-2">
              <ProgressBar value={entry.progress.value} max={entry.progress.max} />
            </div>
          )}
        </div>
      ))
    }
  </div>
</BentoCard>
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm astro check`
Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/NowCard.astro
git commit -m "feat(about): add NowCard featured card"
```

---

## Task 4: Rewrite `MusicCard.astro`

**Files:**
- Modify: `src/components/about/MusicCard.astro` (full replace)

- [ ] **Step 1: Replace file contents**

```astro
---
import BentoCard from "./BentoCard.astro";
import { MUSIC_TASTE } from "@/data/about";
---

<BentoCard prompt="$ taste --music">
  <ul class="space-y-3">
    {
      MUSIC_TASTE.map(row => (
        <li class="grid grid-cols-[auto_1fr] items-baseline gap-3">
          <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-muted whitespace-nowrap">
            {row.label}
          </span>
          <span class="text-sm text-foreground line-clamp-2">{row.value}</span>
        </li>
      ))
    }
  </ul>
</BentoCard>
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm astro check`
Expected: the `MusicCard` error from Task 1 is gone. Other dangling-import errors from deleted-card consumers still present.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/MusicCard.astro
git commit -m "refactor(about): rewrite MusicCard as 3 labeled rows"
```

---

## Task 5: Rewrite `IdentityCard.astro`

**Files:**
- Modify: `src/components/about/IdentityCard.astro` (full replace)

- [ ] **Step 1: Replace file contents**

```astro
---
import BentoCard from "./BentoCard.astro";
import { IDENTITY } from "@/data/about";
---

<BentoCard prompt="$ whoami --verbose">
  <div class="flex flex-col gap-3">
    <p class="text-sm font-semibold text-foreground">{IDENTITY.oneLiner}</p>
    <ul class="flex flex-wrap gap-1.5">
      {
        IDENTITY.values.map(v => (
          <li class="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {v}
          </li>
        ))
      }
    </ul>
    <p class="text-sm leading-relaxed text-muted line-clamp-3">{IDENTITY.prose}</p>
  </div>
</BentoCard>
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm astro check`
Expected: the `IdentityCard` error from Task 1 is gone.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/IdentityCard.astro
git commit -m "refactor(about): rewrite IdentityCard with one-liner, pills, prose"
```

---

## Task 6: Create `AtlasTabs.tsx` client island

**Files:**
- Create: `src/components/about/AtlasTabs.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react";
import type { AtlasLanguage, AtlasPlace } from "@/data/about";

type Props = {
  languages: AtlasLanguage[];
  places: AtlasPlace[];
};

export default function AtlasTabs({ languages, places }: Props) {
  const [tab, setTab] = useState<"languages" | "places">("languages");

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className="flex gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
        <button
          role="tab"
          aria-selected={tab === "languages"}
          onClick={() => setTab("languages")}
          className={`rounded-md border px-2 py-1 transition-colors ${
            tab === "languages"
              ? "border-accent text-accent"
              : "border-border/60 text-muted hover:text-foreground"
          }`}
        >
          languages
        </button>
        <button
          role="tab"
          aria-selected={tab === "places"}
          onClick={() => setTab("places")}
          className={`rounded-md border px-2 py-1 transition-colors ${
            tab === "places"
              ? "border-accent text-accent"
              : "border-border/60 text-muted hover:text-foreground"
          }`}
        >
          places
        </button>
      </div>

      {tab === "languages" ? (
        <ul className="space-y-1.5">
          {languages.map(l => {
            const filled = "▓".repeat(l.level) + "░".repeat(4 - l.level);
            return (
              <li
                key={l.code}
                className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 text-sm"
              >
                <span className="font-mono text-[10px] uppercase text-muted">{l.code}</span>
                <span className="truncate">{l.name}</span>
                <span className="font-mono text-[11px] text-accent">{filled}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-1.5">
          {places.map(p => (
            <li
              key={p.code + p.city}
              className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-2 text-sm"
            >
              <span className="font-mono text-[10px] uppercase text-muted">{p.code}</span>
              <span className="truncate">
                {p.city}
                {p.note && <span className="text-muted"> — {p.note}</span>}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {p.kind}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm astro check`
Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/AtlasTabs.tsx
git commit -m "feat(about): add AtlasTabs client island"
```

---

## Task 7: Create `AtlasCard.astro`

**Files:**
- Create: `src/components/about/AtlasCard.astro`

- [ ] **Step 1: Create the component**

```astro
---
import BentoCard from "./BentoCard.astro";
import AtlasTabs from "./AtlasTabs";
import { ATLAS } from "@/data/about";
---

<BentoCard prompt="$ atlas">
  <AtlasTabs client:visible languages={ATLAS.languages} places={ATLAS.places} />
</BentoCard>
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm astro check`
Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/AtlasCard.astro
git commit -m "feat(about): add AtlasCard merging languages and places"
```

---

## Task 8: Rewire `src/pages/en/about.astro` and delete obsolete cards

**Files:**
- Modify: `src/pages/en/about.astro` (replace main content)
- Delete: `src/components/about/ObsessionsCard.astro`
- Delete: `src/components/about/JoysCard.astro`
- Delete: `src/components/about/LearningCard.astro`
- Delete: `src/components/about/PassportCard.astro`
- Delete: `src/components/about/LanguagesCard.astro`

- [ ] **Step 1: Replace `src/pages/en/about.astro` contents**

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
import NowCard from "@/components/about/NowCard.astro";
import GamesCard from "@/components/about/GamesCard.astro";
import MusicCard from "@/components/about/MusicCard.astro";
import AnimeCard from "@/components/about/AnimeCard.astro";
import AtlasCard from "@/components/about/AtlasCard.astro";
import IdentityCard from "@/components/about/IdentityCard.astro";

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

    <section id="now" class="pt-8 pb-6">
      <NowCard />
    </section>

    <section id="archive" class="pb-10">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GamesCard />
        <BentoCard prompt="$ ls ~/bookshelf">
          <div class="max-h-[18rem] overflow-auto">
            <Bookshelf client:visible />
          </div>
        </BentoCard>
        <MusicCard />
        <AnimeCard />
        <AtlasCard />
        <IdentityCard />
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

- [ ] **Step 2: Delete obsolete card files**

```bash
git rm src/components/about/ObsessionsCard.astro \
       src/components/about/JoysCard.astro \
       src/components/about/LearningCard.astro \
       src/components/about/PassportCard.astro \
       src/components/about/LanguagesCard.astro
```

- [ ] **Step 3: Run type check**

Run: `pnpm astro check`
Expected: zero errors.

- [ ] **Step 4: Run full build**

Run: `pnpm build`
Expected: build completes successfully; `dist/en/about/index.html` is produced.

- [ ] **Step 5: Commit**

```bash
git add src/pages/en/about.astro
git commit -m "feat(about): rewire page to Now + archive grid, remove merged cards"
```

---

## Task 9: Manual verification — overflow and responsiveness

**Files:** none — verification only.

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`
Expected: server starts, typically at `http://localhost:4321`.

- [ ] **Step 2: Visually verify at three breakpoints**

Open `http://localhost:4321/en/about` and resize the browser (or use devtools):

- `< 640px`: single column; Now tiles stack 2×2; archive cards stack 1-up.
- `640–1024px`: archive grid is 2 columns; Now tiles are 4-across.
- `≥ 1024px`: archive grid stays 2 columns (not 3 or 4); Now tiles 4-across.

For each width, confirm:
- No text escapes any card boundary.
- Konami cat still triggers on `↑ ↑ ↓ ↓ ← → ← → b a`.
- Bookshelf card scrolls internally without pushing layout.

- [ ] **Step 3: Overflow stress-test**

Temporarily edit `src/data/about.ts` to set `NOW.playing.title` to a 120-char string and `IDENTITY.prose` to a 600-char string. Reload. Confirm:
- Now tile title clamps to 2 lines with ellipsis.
- Identity prose clamps to 3 lines.
- No horizontal scroll appears at any breakpoint.

Revert the edit: `git checkout -- src/data/about.ts`

- [ ] **Step 4: Stop dev server and final build check**

Stop `pnpm dev`. Run: `pnpm build`
Expected: build completes with no warnings introduced by this change.

- [ ] **Step 5: Commit (if any docs/minor fixes were needed during verification)**

If Step 3 revealed a clamping bug you had to fix in a card, commit those fixes now:

```bash
git add -A
git commit -m "fix(about): clamp overflow in <card>"
```

If nothing needed fixing, skip this step — no empty commit.

---

## Done

All 9 tasks complete produces a working redesigned `/en/about` page matching the spec, passing `pnpm astro check` and `pnpm build`, with verified responsive behavior and overflow safety.
