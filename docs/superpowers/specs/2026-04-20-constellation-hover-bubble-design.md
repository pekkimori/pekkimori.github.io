# Constellation Map — Replace click-panel with hover bubble

## Summary

On the projects page, remove the `DetailPanel` that slides in below the star field when a star is clicked. Replace it with a tooltip-style bubble that follows the mouse cursor with a light spring animation and shows project info while hovering a star. Clicking a star now opens its `link` in a new tab (if present).

## Scope

Single file: [src/components/ConstellationMap.tsx](../../../src/components/ConstellationMap.tsx). The per-locale project pages (`src/pages/{,en,ja,pt}/projects.astro`) consume this component and don't need changes.

## Changes

### Remove
- `DetailPanel` component (function and JSX usage, lines ~272–395 of current file)
- `selected: number | null` state and the `setSelected` click handler
- The grid-rows animated container that housed the panel

### Add
- State:
  - `hovered: number | null` — index of currently hovered star
- Mouse tracking on the star-field container:
  - `onMouseMove` captures `clientX/Y` into a target ref
  - A `requestAnimationFrame` loop updates a smoothed position ref using spring physics:
    - `vel += (target - pos) * stiffness` where `stiffness = 0.18`
    - `vel *= damping` where `damping = 0.72`
    - This yields a "light spring": small overshoot, settles quickly
  - Smoothed position written to a `div` via `transform: translate3d(...)` (avoid re-rendering React on every frame; use a ref on the bubble element)
- Per-star handlers:
  - `onMouseEnter` → `setHovered(i)`
  - `onMouseLeave` → `setHovered(null)`
  - `onClick` → if `project.link`, `window.open(project.link, "_blank", "noopener,noreferrer")`; else no-op
- `ProjectBubble` component:
  - `position: fixed`, `pointer-events: none`, offset ~16px from cursor so it doesn't sit under it
  - Contents: icon + title, category (muted), reused `StatusBadge`
  - Fades in on `hovered !== null`, fades out otherwise
  - Rendered at the top level of the returned fragment (outside the star-field so it can escape any container overflow)

### Keep
- Constellation lines lighting up when a connected star is hovered (swap `selected` → `hovered` in `isConnected`)
- Star size/glow boost on active state (now keyed to `hovered`)
- Background star field, twinkle keyframes, hint text
- `StatusBadge` component (reused in the bubble)

## Behavior notes

- Touch devices don't fire hover. The click-to-open-link fallback keeps the feature usable.
- The rAF loop runs whenever `hovered !== null`; stops when null to avoid idle work.
- Bubble starts at the cursor position on first hover (no jump from `0,0`); on subsequent hovers the spring eases toward the new target without re-initializing.
- Bubble z-index sits above the star field and any surrounding content.

## Out of scope

- No change to project data or locale pages
- No new dependencies (spring implemented with a short rAF loop)
