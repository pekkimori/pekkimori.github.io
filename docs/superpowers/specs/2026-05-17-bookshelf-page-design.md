# Bookshelf — dedicated reading page with 3D shelf

## Summary

Replace the Goodreads link on the about-page `BookshelfCard` with an internal link to a new dedicated bookshelf page. The page presents books as spines on a wooden shelf; hovering or focusing a spine rotates the book forward in 3D to reveal its cover; clicking opens a modal with the full review, rating, quote, and metadata. The shelf is sortable A–Z, by theme, or by rating. All three locales (en/pt/ja) get the page with fully translated content.

## Goals

- Self-owned reading log under three locale-prefixed routes — no third-party dependency.
- Tactile, spatial interaction (spine → cover lift) that fits the site's personality without being noisy.
- Catalog data structured for easy growth — adding a book is dropping an image plus appending one entry to a TypeScript file.
- Full keyboard accessibility and `prefers-reduced-motion` fallback.

## Non-goals

- Per-book deep links (`/bookshelf/<slug>`). Modal-only for now; this is the natural upgrade point if needed later.
- Search or filter UI. Sort is enough for current catalog size.
- Pagination. Single page handles ~100 books before needing it.
- Goodreads sync / RSS import. Fully replaced; the `GOODREADS_URL` constant is removed.
- Tests. The site has no existing test setup; verification is manual via `astro dev`.

## Architecture

A single React island (`Bookshelf.tsx`) owns all interactivity (sort state, hover/focus, modal, GSAP animations). Astro pages per locale handle layout chrome and pre-process cover images through Astro's image pipeline, passing the optimized image metadata into the React component as props.

```
Astro page (per locale)
  Layout + Header + Footer
  <Bookshelf lang="en" books={localizedBooks} client:load />
                          │
                          ▼
                  React island
                    ├── sort segmented control (local state)
                    ├── shelf rows (1 or N depending on sort mode)
                    │     └── Book (3D spine ↔ cover, GSAP timeline per book)
                    └── BookModal (focus trap, scroll lock)
```

## Routes & file layout

### New routes

- `/en/bookshelf` → `src/pages/en/bookshelf.astro`
- `/pt/bookshelf` → `src/pages/pt/bookshelf.astro`
- `/ja/bookshelf` → `src/pages/ja/bookshelf.astro`
- `/bookshelf` → `src/pages/bookshelf.astro` (301 redirect to `/en/bookshelf`)

### New files

```
src/
  pages/
    bookshelf.astro                       # redirect to /en/bookshelf
    en/bookshelf.astro                    # mounts Bookshelf island with en data
    pt/bookshelf.astro                    # ...with pt data
    ja/bookshelf.astro                    # ...with ja data
  components/
    bookshelf/
      Bookshelf.tsx                       # React island (sort UI + shelves + modal + GSAP)
      Book.tsx                            # single book (spine + cover faces, GSAP timeline)
      BookModal.tsx                       # modal overlay (focus trap, scroll lock)
      StarBar.tsx                         # ASCII star rating component
      types.ts                            # shared types (Book, LocalizedBook, Lang)
      strings.ts                          # localized UI chrome strings (sort labels, etc.)
  data/
    books.ts                              # catalog (cover imports + per-locale fields)
  assets/
    books/                                # one cover image per book, ~600x900 px source
```

### Edited files

- `src/components/about/BookshelfCard.astro` — Goodreads anchor swapped for internal `/<lang>/bookshelf` link with localized label and `[shelf]` chip.
- `src/data/about.ts` — remove `GOODREADS_URL`, remove `type Book` and `const BOOKS` (catalog moves to `src/data/books.ts`).
- `src/components/about/Bookshelf.tsx` — keep ASCII preview, but inline the 3-book ASCII data directly inside the component (no longer reads from `@/data/about`).

## Data model

### Types (`src/components/bookshelf/types.ts`)

```ts
import type { ImageMetadata } from "astro";

export type Lang = "en" | "pt" | "ja";

export type BookStatus = "read" | "reading" | "want-to-read";

export type BookI18n = {
  title: string;
  author: string;
  theme: string;          // free-form per locale; also the group label in "by theme" view
  review: string;         // paragraphs separated by blank lines
  quote?: string;
};

export type Book = {
  slug: string;
  cover: ImageMetadata | null;       // null = render fallback face
  rating: 1 | 2 | 3 | 4 | 5;
  yearRead: number;
  originalYear: number;
  pageCount: number;
  status: BookStatus;
  spineColor?: string;               // optional hex; fallback derives from --accent
  i18n: Record<Lang, BookI18n>;
};

// Flattened single-locale shape consumed by Bookshelf.tsx
export type LocalizedBook = Omit<Book, "i18n"> & BookI18n;
```

### Catalog (`src/data/books.ts`)

Exports `BOOKS: Book[]` and a helper `getBooksForLocale(lang: Lang): LocalizedBook[]` that flattens each book into its single-locale shape. The Astro page calls `getBooksForLocale(lang)` plus `getImage()` for each cover, then passes a `LocalizedBook[]` (with `cover` replaced by a pre-resolved `{ src, srcSet, width, height }` object) into the React component.

### Seed data

The three existing books from `src/data/about.ts` (`The Laws of Human Nature`, `The King in Yellow`, `Rich Dad, Poor Dad`) migrate into the new catalog with `cover: null` placeholders. en text reuses the existing quotes; pt/ja review and quote text are drafted as short stubs to be expanded later. Theme strings are drafted per locale.

### Locale-independence note

A single book can land in differently-named theme groups across locales (e.g. `"philosophy"` in en, `"filosofia"` in pt). This is intentional — the design embraces full translation rather than a shared theme enum.

## Cover images

- Source files live in `src/assets/books/<slug>.{jpg,png,webp}`, ~600×900 px minimum (2:3 ratio).
- Imported as `ImageMetadata` in `src/data/books.ts`.
- Each Astro page resolves images server-side via Astro's `getImage()` helper, producing `{ src, srcSet, width, height }` per book. The React island renders plain `<img>` tags with these attributes plus `loading="lazy"` and `decoding="async"`.
- Books with `cover: null` render a fallback face: solid `spineColor` (or `--accent` tint) background with monospace `<title> // <author>` printed across the front.
- Every cover face renders in a fixed 2:3 box, `object-fit: cover`, no distortion.

## Sort UI & layout

### Page structure (top → bottom)

1. **Hero line** — terminal-style header matching the about page voice: `$ cat ~/bookshelf/*` plus a one-line count: `<N> books · <M> currently reading`.
2. **Sort segmented control** — three buttons (`A–Z`, `by theme`, `by rating`). Local React state, no URL params. Keyboard: arrow keys move focus, Enter/Space activates. `aria-pressed` on each button.
3. **Shelf area** — see below.
4. **Footer hint** — small monospace line: `# hover a spine to see the cover · click for review`. Touch-device variant: `# tap once to lift, twice for review`.

### Shelf rendering by sort mode

- **A–Z** — one continuous shelf. `Intl.Collator(lang)` sort by title. Single wooden-bar baseline under the row; books wrap to multiple rows on overflow, each row gets its own baseline.
- **by theme** — multiple shelves stacked. Themes ordered alphabetically (collator-aware). Each theme renders a label above its bar (e.g. `// philosophy`) and a row of spines. Within a theme: A–Z by title.
- **by rating** — single shelf, books sorted by `rating` desc, then `yearRead` desc, then title. ASCII star bar appears beneath each spine in this mode only.

### Status treatments (every sort mode)

- `status: "reading"` — thin accent stripe along the top edge of the spine.
- `status: "want-to-read"` — spine opacity ~60%, floated to the end of its shelf row.
- `status: "read"` — default rendering.

### Empty/edge cases

- A theme with only one book still renders a labeled shelf.
- Zero books in a locale renders `# shelf empty` in monospace.
- `pageCount` and `yearRead` surface only in the modal.

### Responsive sizing

| Breakpoint | Spine size | Hovered cover |
|---|---|---|
| Desktop (`≥768px`) | ~32px × 240px, gap ~6px | ~160 × 240 |
| Mobile (`<768px`) | ~24px × 180px, gap ~4px | ~110 × 180 |

## 3D animation

### Library

GSAP core only (already in deps). No plugins, no ScrollTrigger.

### Per-book DOM structure

```
.book                  // outer slot — fixed width = spine width, reserves row space
  .book-3d             // animated transform; transform-style: preserve-3d
    .face.spine        // visible by default; title + author printed along the spine (see "Japanese spine text" below)
    .face.front        // cover image (or fallback face)
    .face.back         // dark solid face (so back never reads as raw paper)
    .face.top          // 4px sliver, for depth when angled
    .face.bottom       // 4px sliver, for depth when angled
```

`perspective: 1200px` is set on each shelf row (one perspective per row → shared vanishing point per row, not page-wide).

### States

- **Resting** — `.book-3d` is `rotateY(-90deg)` and translated so the spine face aligns with the slot. Subtle drop shadow under the slot.
- **Hover/focus** — GSAP tween: `rotateY: -90 → 0`, `translateZ: 0 → 40`, `translateY: 0 → -12`, ~420ms, `power3.out`. Layered `scale: 1 → 1.04` near the end. Sibling books in the same row tween a ±6px lateral nudge outward (280ms) to give the lifted book breathing room.
- **Leave/blur** — reverse, ~320ms, `power2.in`. Siblings un-nudge in parallel.
- **Click → modal** — book holds the lifted "front" pose while the modal opens. On modal close, the reverse tween starts after a ~180ms delay (so spatial continuity reads as "you set the book down").

### Implementation notes

- One GSAP timeline per `Book` instance, created once in a mount-effect; `play()`/`reverse()` toggled by hover/focus state. Cleanup on unmount.
- Row-level React context (`BookshelfRowContext`) lets a `Book` request its row siblings to nudge without prop-drilling.
- Refs: each `Book` exposes a ref to its `.book-3d` element; rows hold an ordered ref list for sibling nudges.

### Japanese spine text

`writing-mode: vertical-rl` for `lang === "ja"`. Horizontal text for `en` and `pt` (read top-to-bottom along the spine via `rotate: 180deg` + `writing-mode: vertical-rl` is the cleanest cross-locale choice; ja stays naturally vertical).

### Touch devices

Hover doesn't exist. Touch interaction is driven by a single `onClick` handler whose behavior depends on per-book "lifted" state held in the React parent:

- Book is **not lifted** → click lifts this book and lowers any previously lifted sibling. Modal does not open.
- Book is **already lifted** → click opens the modal.

Detection: the React component uses a media query (`(hover: hover)`) to decide which mode is active at render time. On `hover: hover` devices the click always opens the modal (matching the §Modal trigger). On `hover: none` devices the two-step rule applies. Footer hint text reflects the active mode.

### Reduced motion

`prefers-reduced-motion: reduce` short-circuits 3D entirely. Books render as a flat grid of front-facing cover thumbnails; hover adds a 1px accent border, no other transitions. Modal still works.

## Modal

### Trigger

- Hover-capable device: click on a book, or keyboard `Enter`/`Space` while focused.
- Touch device: second tap on an already-lifted book (see §3D animation > Touch devices).

### Backdrop

Full-viewport overlay (`bg-background/80` + `backdrop-blur-sm`), ~180ms fade. Backdrop click closes; `Esc` closes.

### Modal box

- Centered, max-width 640px, max 90vw on mobile.
- Same `border-border` + `bg-background` + `rounded-xl` styling as `BentoCard`.
- Enter: scale 0.96 → 1, fade ~180ms.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [×]                                                    │
│                                                         │
│   ┌───────┐   THE LAWS OF HUMAN NATURE                  │
│   │       │   Robert Greene                             │
│   │ cover │                                             │
│   │       │   ★★★★☆   2024 · 624pp · philosophy        │
│   │       │   first published 2018                      │
│   └───────┘                                             │
│                                                         │
│   ────────────────────────────────────────────────────  │
│                                                         │
│   "Not to become someone else, but to be more           │
│    thoroughly yourself."                                │
│                                                         │
│   ────────────────────────────────────────────────────  │
│                                                         │
│   review:                                               │
│   <multi-paragraph review prose>                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Header row: cover thumbnail (~120 × 180) left; title/author/meta right. Meta line is monospace: `★★★★☆   <yearRead> · <pageCount>pp · <theme>`. Second muted line: `first published <originalYear>`.
- Optional quote block (only if `quote` is set): centered italic monospace + em-dash attribution.
- Review block: site's serif body font, paragraphs split on `\n\n` (no Markdown engine).
- Close `×`: top-right, focusable, monospace.

### Focus management

- On open: focus moves to close button.
- Tab cycles within the modal (trap).
- On close: focus returns to the originating book, then that book's GSAP timeline reverses after the modal's ~180ms exit.

### Scroll lock

`document.body.style.overflow = "hidden"` on open, restored on close. Modal body scrolls internally (`overflow-y-auto`, `max-height: 80vh`).

### Localized chrome

| Key | en | pt | ja |
|---|---|---|---|
| Close aria-label | Close | Fechar | 閉じる |
| "review:" label | review: | resenha: | 感想: |
| About-card link | browse full shelf → | ver estante completa → | 本棚を見る → |
| Page title | bookshelf | estante | 本棚 |
| Sort: A–Z | A–Z | A–Z | A–Z |
| Sort: by theme | by theme | por tema | テーマ別 |
| Sort: by rating | by rating | por nota | 評価別 |
| Empty | # shelf empty | # estante vazia | # 本棚は空です |
| Counts suffix | books · N reading | livros · N lendo | 冊 · N 冊読書中 |

Separators (`·`, `★`, `☆`) and the `//` theme marker stay constant across locales.

## Star bar

`StarBar.tsx` renders `★`-filled and `☆`-empty characters in a monospace span. Always five characters wide. `aria-label="<n> out of 5 stars"`.

## About-page card update

`src/components/about/BookshelfCard.astro`:

- Replace the Goodreads `<a>` block (current lines 9–26) with an internal link `<a href={`/${lang}/bookshelf`}>` styled identically.
- Detect locale from `Astro.url.pathname` the same way `Header.astro` does — no prop changes upstream.
- Link's left chip changes from `[GR]` to `[shelf]`.
- Subtitle changes from `goodreads.com` to a build-time-computed count: `<N> books · <M> reading` (counts derived from `BOOKS` in `src/data/books.ts`).
- The `<Bookshelf client:visible />` mount below the link stays in place. Inline its 3-book ASCII data directly inside `src/components/about/Bookshelf.tsx` so it no longer depends on `@/data/about`. The "three roberts" joke survives.

## Accessibility

- Each book is a `<button type="button">` with `aria-label="<title> by <author>"`. Enter/Space opens modal.
- Sort buttons: `role="button"` with `aria-pressed`; not full ARIA tabs (the panel below is one re-sorted list, not three).
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title element id. Focus trap, focus restore.
- All decorative ASCII gets `aria-hidden="true"`.
- `prefers-reduced-motion: reduce` is respected for all transitions (see §3D animation).

## Performance

- Cover images: lazy-loaded, async-decoded, served via Astro's optimized AVIF/WebP variants.
- One GSAP timeline per book, created on mount, never re-created on event.
- `perspective` + `preserve-3d` scoped per shelf row — no page-wide 3D context.
- React island is `client:load` on the bookshelf page; the about-card mini-preview stays `client:visible`.

## Theming

- All colors via existing CSS variables (`--accent`, `--border`, `--background`, `--foreground`, `--muted`). Automatic light/dark.
- Spine background: `spineColor` (per book, optional) blended with `--background` at ~30%. Fallback: `--accent` at low alpha.
- Every cover face gets a 1px `--border` ring to anchor it in both light and dark themes.

## Verification

Manual via `astro dev`:

1. `/en/bookshelf`, `/pt/bookshelf`, `/ja/bookshelf` render with their localized chrome and review/theme text.
2. Hover a spine → book rotates forward and lifts; siblings nudge.
3. Tab → focus reaches each book and the sort control; keyboard activates lift and modal.
4. Click a book → modal opens with localized chrome; backdrop click, `Esc`, and `×` all close; focus returns to the book.
5. Sort A–Z / by theme / by rating each produces the expected layout; star bars appear only in rating mode; current-reading stripe appears in all modes.
6. `prefers-reduced-motion` simulator → flat grid, no 3D.
7. Mobile viewport: tap to lift, tap again to open; sizing scales down per breakpoint.
8. About card link: `[shelf]` chip, count subtitle, navigates to the correct locale's bookshelf.
9. `/bookshelf` 301-redirects to `/en/bookshelf`.
10. `astro check` and `astro build` succeed; pagefind indexes the new pages.
