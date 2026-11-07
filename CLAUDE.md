# Incident Exposure Calculator

## Project Overview
Single-page interactive cinematography exposure table. Maps ISO sensitivity and T-Stop aperture to required incident foot candles at key. Based on a Google Sheets reference table, rebuilt as a single-file HTML/JS app for GitHub Pages, installable as an offline PWA (e.g. Add to Home Screen on iPad).

- **Live site:** https://geoffsmithbk.github.io/incident-exposure/
- **Source spreadsheet:** https://docs.google.com/spreadsheets/d/1dTwfGgoyIs3vGibT5CMXyhSXe4q3JbgulGEl-vmq9AQ/

## Architecture
- Single `index.html` file — all HTML, CSS, and JS inline
- No build step, no frameworks. Runtime CDN deps: Tailwind Play CDN, Lucide (pinned `lucide@1.70.0` — keep pinned so the offline cache is stable), Google Fonts (Inter, JetBrains Mono)
- Designed for GitHub Pages static hosting; all paths relative (site lives under `/incident-exposure/`)

### PWA / offline
- `manifest.webmanifest` — name, theme colors, icons; linked from `index.html` alongside Apple home-screen meta tags
- `sw.js` — service worker, registered at the end of `index.html`. Precaches the page, icons and CDN assets on install; runtime-caches Google Fonts files. Strategy is stale-while-revalidate for everything, so users see updates on the *second* launch after a deploy
- Bump `VERSION` in `sw.js` when the precache list changes (old caches are deleted on activate)
- App version is the `v1.x` chip in the `index.html` header; on a version bump, set `sw.js` `VERSION` to match
- Icons: source is `img/icons/icon.svg`; regenerate PNGs with `rsvg-convert -w <size> -h <size> icon.svg -o <file>` (180 apple-touch, 192, 512)

## Data Model
The exposure table is a diagonal shift pattern through a single value sequence:

- **Value sequence** (25 entries, 1/3-stop increments): 1.56, 2.35, 3.13, 4.7, 6.25, 9.375, 12.5, 18.75, 25, 37.5, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1200, 1600, 2400, 3200, 4800, 6400
- **Anchor:** Index 12 (value 100) = T2.8 @ ISO 100
- **Lookup:** For T-stop row `r`, ISO column `c`: `value_index = 12 + r - c`

## Key Assumptions
- 24 fps, 180° shutter angle (standard cinema)
- "T Good" = half-stop between T2.8 and T4 (~T3.3)
- Half-stop rows use 1.5× the previous full-stop value (practical rounding, not strict √2)

## Features
- Interactive table with click-to-select and cross-highlighting; selection is stored in the URL hash (`#r=<row>&c=<col>`), default is T2.8/4 split @ ISO 800 = 18.75 fc
- Arrow keys move the selection; Escape deselects (`deselectCell()` clears readouts, highlights and hash)
- Readout cards: Selected Exposure, T-Stop, Sensitivity, EV₁₀₀ — 2-up below Tailwind `lg` (1024px), 4-up above
- Tapping the Selected Exposure value toggles fc ↔ lux (intentionally undiscoverable, no UI hint); choice persisted in `localStorage` key `illumUnit`
- "Find by Available Light" — enter foot candles to highlight matching ISO/T-Stop combos; entering a value deselects the pinned cell
- On load, the table scrolls so the selected ISO column is horizontally centered in the viewport (when the table overflows)
- Sticky T-stop column must keep opaque backgrounds (highlight tint is layered over a solid base) so scrolled cells don't show through
- Heat map color coding (cool=low light, warm=bright)
- Toggle half-stop rows on/off
- Common light level reference table

## Development Notes
- Test locally: `python3 -m http.server 8770` then open `http://localhost:8770/index.html`
- The service worker serves the cached page first, so local edits may not appear on the first reload. When testing, unregister the SW and clear caches (DevTools → Application), or block `sw.js` (e.g. Playwright `page.route('**/sw.js', …)` returning 404)
- Check layouts at phone (~375px), iPad portrait (~744–820px) and wide (≥1024px) widths
- Credit: Adapted from cinematography.net (CML, Geoff Boyle NSC FBKS, 1950–2021)
