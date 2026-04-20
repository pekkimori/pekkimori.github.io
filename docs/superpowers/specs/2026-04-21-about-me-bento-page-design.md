# About Me Page — Bento Dashboard

## Goal

Add a playful-but-polished "About Me" page at `/en/about` that communicates Rafael's interests, hobbies, and identity through a bento-grid layout with CLI/ASCII accents. English only for this iteration; Portuguese and Japanese translations deferred.

## Aesthetic

- **Base:** Matches the existing site's clean typography and accent color tokens.
- **Personality layer:** Terminal-style prompts as section headers, ASCII art for book covers, small looping GIFs for delight moments, subtle hover micro-interactions.
- **No emojis.** All decorative glyphs are ASCII characters, SVG icons, or GIFs.

## Page Structure

1. Hero — terminal window with typewriter animation and a cat GIF.
2. Bento grid — 10 cards describing facets of Rafael.
3. Footer strip — monospace status line.

### 1. Hero

Full-width section at top of the page.

**Left panel (grows to fill on mobile):**

A styled terminal window with:
- Window chrome: three colored dots (`#ff5f56`, `#ffbd2e`, `#27c93f`) and a title bar reading `rafael@polymath: ~`.
- Body with monospace content, rendered via a typewriter React island:
  ```
  $ whoami
  > rafael mori
  > polymath · INTJ 145 · truth · energy · love

  $ cat ~/intro.md
  > building systems, exploring brains,
  > collecting countries, ranking cheeses.

  $ _
  ```
- Blinking underscore cursor at the end, persists after typing finishes.
- Typing speed: roughly 35ms per character with slight jitter. Pauses at blank lines.
- `prefers-reduced-motion: reduce` skips the animation and renders the final state.

**Right panel (desktop only, ≥md breakpoint):**

A single looping cat GIF, ~240px square, with subtle rounded corners and a faint drop shadow.

On mobile, the GIF moves below the terminal.

### 2. Bento Grid — 10 Cards

Responsive grid using CSS `grid-template-columns`:

| Breakpoint | Columns |
|---|---|
| `< sm` | 1 |
| `sm`–`md` | 2 |
| `lg` | 3 |
| `xl+` | 4 |

Cards declare column and row spans so the layout reads as a composed bento, not a spreadsheet.

Each card is rendered via a shared `BentoCard.astro` shell that provides:
- Outer container with rounded corners, border, and consistent padding.
- Slot for a terminal-prompt header in monospace (e.g. `$ cat ~/books`).
- Slot for the body content.

**Card catalog:**

| Card | Slug | Span (xl) | Header prompt | Body |
|---|---|---|---|---|
| Games | `games` | 2×2 | `$ steam --now-playing` | Steam widget iframe embedded below (see "Steam embed" note), plus three pinned favorites: Hollow Knight, Nier Automata, League of Legends. Each pinned favorite is a small horizontal row: title in sans-serif, one-line self-written comment in monospace. |
| Music | `music` | 2×1 | `$ spotify --playlist` | Official Spotify embed iframe for playlist `5X9BtccLFJs3ophR6tL5br`. Compact variant (height 152). |
| Bookshelf | `books` | 2×2 | `$ ls ~/bookshelf` | Three ASCII-art book covers on an ASCII "wooden shelf" separator. Books: *The Laws of Human Nature* (Robert Greene), *The King in Yellow* (Robert W. Chambers), *The Hitchhiker's Guide to the Galaxy* (Douglas Adams). Rendered as `<pre>` blocks; hovering a cover tilts it ~4° and reveals a one-line quote underneath. |
| Anime | `anime` | 2×1 | `$ cat ~/anime/favorites.txt` | Three stylized title cards in a row: Fullmetal Alchemist, Steins;Gate, Bakemonogatari. Each card is a monospace title on a muted background, subtle parallax on hover (scale 1.03). |
| Obsessions | `obsessions` | 1×1 | `$ tags` | Pill tags: philosophy, neuroscience, mathematics, coding, ascii art. |
| Languages | `languages` | 2×1 | `$ polyglot --status` | List of languages with monospace progress bars built from box-drawing characters, e.g. `pt [████████████] fluent`. Rows: Portuguese (fluent), English (fluent), Spanish (fluent), Japanese (intermediate), Russian (queued), Chinese (queued), German (queued). Hovering a row reveals a greeting in that language. |
| Passport | `passport` | 2×1 | `$ ls ~/passport/stamps` | Two subrows: "stamped" and "next up". Stamped subrow displays SVG country flags (via `flag-icons` npm package) for: BR, PA, US, CO, QA, JP, AU, CL, AR, DE. Each flag is a rounded rectangle ~32×24px with a faint border. Hovering a flag displays the country name in monospace below. "Next up" subrow shows empty bordered rectangles with `?` centered. |
| Small joys | `joys` | 1×1 | `$ ls ~/joys` | A 2×3 or 3×2 grid of tiny looping GIFs (~80px square each), one per joy: cats, ice cream, cheese, coffee, beer, silly/goofy. Monospace label below each GIF. |
| Identity | `identity` | 1×1 | `$ stat rafael` | JRPG-style stat block: three rows in monospace: `MBTI ....... INTJ`, `TRITYPE .... 1-4-5`, `CORE ....... truth / energy / love`. |
| Currently learning | `learning` | 1×1 | `$ crontab learning` | Two rows with "loading bars" built from box-drawing characters: `styling     [██████░░░░] 60%` and `crochet     [█░░░░░░░░░] 10%`. |

Percentages on the learning card are honest self-estimates; the spec owner will set them when implementing.

### 3. Footer strip

Below the bento grid, a single-line monospace strip in the terminal accent style:

```
> status: * caffeinated * — last updated: {build-date}
```

`{build-date}` is the ISO date at build time, injected via Astro frontmatter.

### Easter egg: Konami cat

A React island listens for the keystroke sequence `c`, `a`, `t` (typed in order, not in an input field). On trigger, a cat GIF walks horizontally across the bottom of the viewport once (~6 seconds), then removes itself. Silent. Does not fire again until the user reloads the page.

## Interaction Details

- Book covers: CSS transform `rotate(-4deg) translateY(-4px)` on hover, quote fades in below.
- Flags: scale 1.1 and country name fades in below the row on hover.
- Language rows: greeting text fades in on row hover.
- Joy GIFs: grayscale filter at rest, full color on hover. Respects `prefers-reduced-motion`.
- All animations respect `prefers-reduced-motion: reduce` — hover transforms stay, but auto-playing motion (typewriter, Konami cat) is disabled or snapped to final state.

## Technical Plan

### New files

- `src/pages/en/about.astro` — page layout, imports `Layout`, `Header`, `Footer`, and the cards below.
- `src/components/about/BentoCard.astro` — shared card shell.
- `src/components/about/AboutHeroTerminal.tsx` — typewriter React island.
- `src/components/about/Bookshelf.tsx` — ASCII covers + hover quotes (React island because of interactive hover state tracking for mobile tap-to-reveal).
- `src/components/about/KonamiCat.tsx` — keystroke listener island.
- `src/components/about/GamesCard.astro`, `MusicCard.astro`, `AnimeCard.astro`, `ObsessionsCard.astro`, `LanguagesCard.astro`, `PassportCard.astro`, `JoysCard.astro`, `IdentityCard.astro`, `LearningCard.astro` — server-rendered card contents.
- `src/data/about.ts` — content data: books with quotes, language rows with greetings, joys with GIF URLs, etc. Keeps copy out of components so it's easy to edit.

### Modified files

- `src/components/Header.astro` — add "About" link in the nav between Portfolio and Search. Include `/about` in `knownPaths`. Use label `{ en: "About", pt: "Sobre", ja: "自己紹介" }` even though pt/ja pages don't exist yet — link will gracefully fall back via the lang switcher's existing behavior.
- `src/pages/about.astro` — new root-level redirect to `/en/about`, matching the pattern of `portfolio.astro`.

### New dependencies

- `flag-icons` (npm) — provides country flag SVGs. Adds CSS class-based flag rendering. Small package, standard choice.

### Steam embed

Steam does not expose a first-party iframe widget for public profiles. Two viable paths — implementer picks one:

1. **Static "profile card" HTML** — hand-built card with avatar, profile link, and latest games. Avatar and game list are copy-pasted from the profile at implementation time. Fully static, no external iframe. This is the recommended default.
2. **Community widget** — one of the third-party Steam widget generators (e.g., `steam-profile.com`) that renders an iframe. Trades external dependency for automatic "currently playing" data.

Default to option 1 unless the user explicitly requests live data.

### GIF assets

- Cat hero GIF, Konami cat walking GIF, and six joy GIFs are stored as local static assets under `src/assets/gifs/about/`. Using local assets avoids external hotlinking and keeps page load predictable. File sizes kept under ~200KB each; target 80–150KB.
- The spec owner will select and add the GIF files during implementation.

### Fonts

Uses the existing site font stack. Monospace sections use the site's existing mono token (or falls back to `ui-monospace, SFMono-Regular, Menlo, monospace`).

### Accessibility

- Typewriter and Konami animations respect `prefers-reduced-motion`.
- Steam and Spotify iframes have `title` attributes.
- All GIFs include descriptive `alt` text.
- Book cover `<pre>` blocks are marked `aria-hidden="true"` and the book title is rendered separately in readable text so screen readers get clean content.
- Flag SVGs have `aria-label` with the country name; the hover-reveal name is also present as a `<span class="sr-only">` for keyboard users.
- Keyboard focus states match the site's existing `focus-outline` utility.

### Out of scope

- Portuguese and Japanese translations (follow-up).
- Dark/light theme-specific GIFs (use GIFs that look fine on both).
- Live "currently playing" Spotify data (the static playlist embed is enough).
- CMS-style editing of content (data lives in `src/data/about.ts`).
