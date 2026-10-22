# v0.27 — Living Map interactions

This phase responds to the user's request to **favour a playful, interactive Atlas** rather than delay every interesting visual until the historical boundary geometry or date of transmission is conclusively established.

## Shipped

- The cinematic World Map now has an animated, curved connection layer. Select a society and up to eight *nearby contemporaries* are highlighted with colourful, flowing lines. Connections are selected by the current date, map-region and empire/society filters and sorted using the existing representative coordinates.
- The user can toggle the illustrated connections on and off. The default map mode includes them; switching to an authentic historical-map reproduction or selected-society known-world mode hides the illustrative overlay.
- A **Play history / Pause** control advances the existing chronological selection, with 10/25/50/100-year steps and 1×/2×/4× speeds. The ordinary date slider, date input and prev/next controls still work. Playing stops at the latest date, when the tab is hidden or the page is unloaded.
- Native map controls, existing pan/zoom and selected society links remain unchanged. The SVG arcs sit inside the existing transform, so they move with the map.
- No new external asset requests, API services or backend. Animation is CSS-based and reduced-motion users are not auto-played.

## Intentional distinction

The paths are **not claimed to be documented historic routes or diplomatic contacts**. They illustrate geographical proximity among concurrently catalogued societies. The on-screen caption makes this distinction clear; the actual source-backed relationships remain in the existing evidence panels. This allows a cinematic, explorable experience *now*, even when no exact political border or transmission route exists.

The next cinematic increments can add authored story journeys and illustrated region layers using this same visual model, while allowing estimates and interpretations to be explored without presenting them as certain.

## QA

- `living-map-test.mjs` verifies selection, coexistence filtering, link toggling, no overlays on original maps, static dependencies and motion preferences.
- Existing regression suite still covers chronology, source links, map markers, URL navigation and research.
- GitHub Chromium browser audit tests six screens at desktop/mobile widths, page errors and horizontal overflow.

The design treats interesting visual explanations as a UI affordance rather than a data-integrity exception.
