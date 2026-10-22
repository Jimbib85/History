# v0.26 — The Living Atlas visual foundation (first increment)

The four user-supplied design concepts inspired a darker, more cinematic interface. This release establishes an incremental, **reusable** design system and deploys it on the **World Map first**, leaving Story, Compare, Technology, Discover, Their World and Conflicts on their existing layouts pending separate, tested releases.

## Design system
- `public/atlas-cinematic.css` defines shared navy, ivory, aged-gold, surfaces, borders, glows, focus states and reduced-motion behavior.
- `public/atlas-cinematic-map.css` adds World Map layouts and styles: darker stage, stronger marker selection, gold current-year control, map-mode tabs, readable research panels, historical time-slider and mobile map-first browsing.
- Styles are scoped under `.atlas-cinematic`. Non-map screens remain unchanged. No framework, tracking library or external background images are needed.
- Source and historical interpretation remain unaltered. The current `world.svg` is still a present-day geographic reference; markers are approximate geographical reference locations, **not empire borders or reconstructed trade routes**.

## Accessibility and performance
- Visible keyboard focus, standard native interactive controls, no new modal, no replacement event handlers.
- 44px minimum mobile tab buttons and zoom controls; single-column map-first layout below 820px.
- `prefers-reduced-motion` disables decorative transitions.
- No additional external network requests or historical map files; just two CSS files with enforced byte budgets.

## Review and next iterations
- Run `npm test`; the new `cinematic-map-test.mjs` checks critical controls, existing view modes, CSS design tokens, performance limits and reduced motion.
- GitHub Chromium browser audit checks desktop 1280px and mobile 390px for runtime errors, horizontal overflow, historical navigation and snapshot screenshots.
- This is **phase 1 + the first World Map styling increment**. Further development can add optional historically sourced map artwork and society-specific imagery without fabricating geopolitics. The next iteration should run a manual screenshot review and measure contrast, discoverability and mobile scroll behavior before changing the historical rendering engine.
