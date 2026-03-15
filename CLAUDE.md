# Incident Exposure Calculator

## Project Overview
Single-page interactive cinematography exposure table. Maps ISO sensitivity and T-Stop aperture to required incident foot candles at key. Based on a Google Sheets reference table, rebuilt as a zero-dependency HTML/JS app for GitHub Pages.

- **Live site:** https://geoffsmithbk.github.io/incident-exposure/
- **Source spreadsheet:** https://docs.google.com/spreadsheets/d/1dTwfGgoyIs3vGibT5CMXyhSXe4q3JbgulGEl-vmq9AQ/

## Architecture
- Single `index.html` file — all HTML, CSS, and JS inline
- No build step, no dependencies, no frameworks
- Designed for GitHub Pages static hosting

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
- Interactive table with click-to-select and cross-highlighting
- "Find by Available Light" — enter foot candles to highlight matching ISO/T-Stop combos
- Heat map color coding (cool=low light, warm=bright)
- Toggle half-stop rows on/off
- Lux conversion and approximate EV readout
- Common light level reference table

## Development Notes
- Test locally: `python3 -m http.server 8770` then open `http://localhost:8770/index.html`
- Credit: Adapted from cinematography.net (CML, Geoff Boyle NSC FBKS, 1950–2021)
