# About Page Redesign — Design Spec

**Date:** 2026-04-21
**Scope:** `/en/about` (and its cards). Other locales unchanged.

## Goals

1. Fix content overflowing card boxes.
2. Reduce visual clutter (10 cards → 7) and cut thematically-overlapping cards.
3. Give the page a clear visual anchor instead of a flat pinboard of equal cards.
4. Commit to one coherent visual direction (hybrid: terminal chrome + modern structured cards) instead of the current mix.

## Non-Goals

- No live third-party API integration (Steam / Last.fm / MAL). Data is hand-curated in `src/data/about.ts`.
- No i18n work for new cards. English only — matches current state; `/ja` and `/pt` about pages are not touched.
- No new animation library. Only CSS `@keyframes`.
- No dark/light theme variants — existing theme tokens already handle both.
- No changes to `AboutHeroTerminal.tsx`, `Bookshelf.tsx`, or `KonamiCat.tsx` beyond call-site wiring.

## Visual Direction: Hybrid

Terminal frame on the outside (prompt headers, mono accents), clean structured cards on the inside (system sans, tiny uppercase labels, short values, progress meters). Keeps the dev-identity personality while solving overflow via structure rather than prose.

**Typography:**
- `font-mono` — prompt headers, tiny uppercase labels, progress meters, terminal hero only.
- `font-sans` — all card values and titles (readability over vibe).

**Palette:** existing theme tokens only (`accent`, `foreground`, `muted`, `border`, `background`).

**Motion:** hover → accent border (existing). Now card progress meters one-time fill animation on `astro:page-load` via CSS `@keyframes`. No JS for motion.

## Page Architecture

```
Hero (terminal prompt + cat gif)
Now (featured, full-width, 4 mini-tiles)
Archive grid (2-column, 6 cards: Games, Bookshelf, Music, Anime, Atlas, Identity)
Footer strip (build-date)
KonamiCat (unchanged)
```

**Responsive grid:**
- `<640px`: 1 column. Now tiles stack 2×2.
- `640–1024px`: 2 columns. Now tiles 4-across.
- `≥1024px`: 2 columns (not 3/4 — uniformity over density). Now tiles 4-across.
- Hero cat gif: `md:` and up only (unchanged).

## Card Inventory

| Card | Prompt | Content | Overflow strategy |
|---|---|---|---|
| Hero | `$ about rafael` | existing `AboutHeroTerminal` | n/a |
| **Now** (featured) | `$ now --live` | 4 tiles: playing / reading / listening / watching | fixed tile size, 1-line meta |
| Games | `$ steam --pinned` | Steam profile link + top 4 pinned games | cap at 4 |
| Bookshelf | `$ ls ~/bookshelf` | existing `Bookshelf` component | `max-h-[18rem] overflow-auto` |
| Music | `$ taste --music` | 3 labeled rows: "on repeat" / "lately" / "forever" | fixed 3 rows |
| Anime | `$ mal --recent` | 6 titles with status | cap at 6 |
| Atlas | `$ atlas` | Tabs: Languages / Places (client-side toggle) | cap each list |
| Identity | `$ whoami --verbose` | one-liner + 3–5 value pills + ~3-line prose | `line-clamp-3` on prose |

**Merges (from triage):**
- `LanguagesCard` + `PassportCard` → **Atlas** (tabbed).
- `ObsessionsCard` + `JoysCard` + `LearningCard` → absorbed by **Now** (present-tense interests) and **Identity** (values).

**Removed (files deleted):**
- `src/components/about/ObsessionsCard.astro`
- `src/components/about/JoysCard.astro`
- `src/components/about/LearningCard.astro`
- `src/components/about/PassportCard.astro`
- `src/components/about/LanguagesCard.astro`

## Component Boundaries

**New:**
- `NowCard.astro` — static, 4 tiles, reads `NOW` from data file. No client JS.
- `AtlasCard.astro` — server-rendered shell + one small client island for the Languages/Places tab toggle (`client:visible`).
- `ProgressBar.astro` — tiny utility. Props: `value: number`, `max: number`, optional `label?: string`. Renders `▓▓▓▓░` with the filled portion accent-colored. Used by Now and Atlas.

**Rewritten:**
- `MusicCard.astro` — 3 labeled rows, not prose.
- `IdentityCard.astro` — one-liner + value pills + clamped prose.

**Unchanged:**
- `BentoCard.astro` (already correct chrome)
- `GamesCard.astro`
- `AnimeCard.astro`
- `Bookshelf.tsx`
- `AboutHeroTerminal.tsx`
- `KonamiCat.tsx`

## Data Model

Extend `src/data/about.ts`:

```ts
export const NOW: {
  playing:   { title: string; meta: string; progress?: { value: number; max: number } };
  reading:   { title: string; meta: string; progress?: { value: number; max: number } };
  listening: { title: string; meta: string };
  watching:  { title: string; meta: string; progress?: { value: number; max: number } };
};

export const PINNED_GAMES: { title: string; comment: string }[]; // length ≤ 4
export const BOOKSHELF:    { title: string; author: string; status: string }[]; // length ≤ 12
export const MUSIC_TASTE:  { label: "on repeat" | "lately" | "forever"; value: string }[]; // length 3
export const ANIME:        { title: string; status: string }[]; // length ≤ 6
export const ATLAS: {
  languages: { code: string; name: string; level: 0 | 1 | 2 | 3 | 4 }[];
  places:    { code: string; city: string; note: string; kind: "lived" | "visited" }[];
};
export const IDENTITY: {
  oneLiner: string;          // 1 sentence
  values: string[];          // 3–5 short phrases
  prose: string;             // ~3 lines, clamped in UI
};
```

All user-visible text lives here. No prose hardcoded in `.astro` files.

## Page Wiring

`src/pages/en/about.astro` rewrite:

- Keep: `Layout`, `Header`, `Footer`, `Hr`, `AboutHeroTerminal`, `KonamiCat`, hero GIF, build-date footer strip, `sessionStorage` back-url script.
- Replace the existing bento `<section id="bento">` body with:
  - `<NowCard />` (full-width)
  - A uniform 2-column grid wrapping: `<GamesCard />`, `<BentoCard prompt="$ ls ~/bookshelf"><Bookshelf client:visible /></BentoCard>`, `<MusicCard />`, `<AnimeCard />`, `<AtlasCard />`, `<IdentityCard />`.

## Testing

- Manual browser check at `sm / md / lg` widths via `pnpm dev`.
- Deliberately long-string spot-check: temporarily pad one entry per card with ~200 chars to verify clamping/truncation holds.
- `pnpm build` and `pnpm astro check` must pass.
- Konami cat easter egg still triggers after rewrite.
