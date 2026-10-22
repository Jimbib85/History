# v0.19 — Cross-view continuity and browser usability

## Navigation
Every Atlas screen has the same seven named destinations: Story, World Map, Compare, Technology, Their World, Discover and Conflicts. The navigation is a **horizontally scrollable single row** on smaller displays, with 44px minimum hit targets, keyboard access and a visible current-view state. It does not require a hamburger menu or second screen.

`public/atlas-links.js` takes the selected year and society from the current reader state, falling back to valid URL parameters. It updates the marked links immediately before activation, including keyboard activation, link-copy context menu and middle-click. The destination receives only parameters it understands:

| Destination | Supported context |
| --- | --- |
| Story | year, entity |
| World Map | year, civ |
| Compare | year, civ |
| Technology | year, civ, #technology |
| Their World | year, civ |
| Discover | year |
| Conflicts | none — does not currently implement a year selector |

A malformed date, unsupported society identifier, or an unselected entity is **not** carried across as historical fact. The helper does not rewrite the address of the current page, interrupt browser back/forward navigation, or alter original source data.

## Real-browser test
The optional `.github/workflows/browser-audit.yml` PR job uses the Chrome/Chromium installed on the GitHub Actions runner with the small `playwright-core` library (no bundled browser download). It serves `public/` from localhost and visits six pages at 1280×800 and 390×844.

It saves 12 viewport screenshots and `artifacts/browser-audit/measurements.json`, recording each page's actual local navigation/loading times, first-party transfer sizes, scroll widths, navigation availability and uncaught page exceptions. An overflow greater than 24 CSS pixels at 390px is considered a regression; the comparison timeline can still scroll within its own container.

**Interpretation:** These are genuine browser observations in an Actions Linux VM against an uncompressed, local static server. They are **not** global latency benchmarks, Cloudflare edge performance, field Core Web Vitals or evidence of how a specific user's phone will perform. The audit does not need user accounts or private analytics. To run again manually, use Actions → Browser UX and performance smoke → Run workflow.

Keep the existing lightweight static architecture. Do not add analytics trackers, paid hosting, or universal UI frameworks solely to improve browser scores. Optimize measured bottlenecks only.
