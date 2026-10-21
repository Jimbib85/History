# World History Atlas

**Version 0.1.0 — a playable personal history toy**

Explore what different societies were doing at the same time. The application is a simple static website with no login, database, build pipeline, accounts or paid map services.

## Start using it

1. Extract the zip somewhere on your computer.
2. Open `index.html` in Chrome, Edge or Firefox. It runs directly from the folder.
3. If your browser restricts local files, run `py -m http.server 5173` from this folder on Windows and visit `http://localhost:5173`.
4. For public hosting, upload the contents of this folder to a static site host such as Cloudflare Pages. No build command or environment variables are required.

The world map, text and chronology work offline. Archived historical map images open from Wikimedia Commons and need an internet connection.

## Things you can do

- **Choose a year:** Use the broad timeline slider, featured year chips, hundred-year controls, previous/next historical moment buttons, or type a year such as `500 BCE`, `200 CE`, or `-499` (astronomical year numbering).
- **Choose a society:** Click a point on the map, select a civilisation from the left list, or search by name.
- **See who lived concurrently:** The bottom timelines show societies whose periods overlap with the selected year. The marker is a representative geographic centre, *not* a reconstructed political border.
- **Actual world:** A current-geography basemap with historical centre markers.
- **Their world map:** A preserved historical map, later copy or clearly identified reconstruction when a suitable example is curated. If there is no map, the application says so rather than making one up.
- **World they knew:** A modest view of illustrative known geographic contacts or historical geographical knowledge. It does *not* purport to show a definitive area of knowledge.
- **Surprise me:** Select a random date and a contemporary society. Use the dropdown for a different society at the same date or a different period for the currently selected society.
- **Back:** Return to a previous discovery.
- **Share:** Copy the browser address bar URL; it encodes the year, chosen civilisation and map view.

## Add your own history

Edit `data.js`, which contains:

- `CIVILISATIONS`: society/state names, approximate periods, location, introduction, source URL, region and optional historic map ID.
- `EVENTS`: notable events linked to societies.
- `MOMENTS`: featured global points in time and introductory text.
- `MAPS`: curated historic image metadata and links to original image records.
- `PLACES`: optional example locations used in the `World they knew` view.

The source file uses negative whole years for **BCE** as an easy-to-edit shorthand, for example `-500` means `500 BCE`; at runtime the records are converted to astronomical year numbering, where `0 = 1 BCE` and `-499 = 500 BCE`. Positive values are CE. Dates should be labelled approximate when that is all historical evidence supports.

Do **not** add modern country boundary geometries for ancient polities as if those were historical boundaries. Historical maps and links can have copyright and Indigenous cultural permissions attached to them, so preserve attribution and rights conditions for any new additions.

## Current boundaries / honest limitations

This is a first interactive sample, not a comprehensive history encyclopedia. It has a hand-curated sample of important states and societies across different periods and regions. The data reflects selective examples, not a measurement of which cultures existed at every date. The absence of a marker does not mean a region was uninhabited.

The basemap uses present-day geography generated locally from Basemap/GSHHS coarse coastline data. Markers are illustrative cities or regions; territorial polygons are not yet included. Historical world maps are loaded on demand from Wikimedia Commons and may occasionally be unavailable. The app has not yet been tested across every device/browser combination.

## Files

- `index.html`: page and UI structure
- `styles.css`: atlas appearance and responsive layout
- `data.js`: editable starter historical data
- `app.js`: synchronised timeline, views, search, map interaction and randomisation logic
- `world.svg`: bundled basemap; no external tile provider
- `start-windows.bat`: convenience Windows launcher

## Historical map image attributions and reference links

- Ptolemy's *Geography*, later printed map (1482): [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ptolemy_map_15th_century.jpg), public domain. This is not a surviving original Roman map.
- Korean Kangnido, created 1402, later surviving copy: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:GeneralMapOfDistancesAndHistoricCapitals.jpg). Consult the file for reproduction rights.
- Fra Mauro map, c.1450, later 1806 copy: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Fra_Mauro_World_Map,_c.1450_(1806_copy).jpg), public domain according to Commons.
- General historical descriptions link to further reading pages from *Encyclopaedia Britannica*, Te Ara or AIATSIS where relevant. These are starting references, not substitutes for specialist scholarship.

### Why there is no database or React setup yet

The priority is to enjoy exploring history and add to the toy when it feels fun. Static HTML/CSS/JavaScript keeps the project exceptionally easy to open and change. A framework or database can be introduced later if the historical content grows enough to justify it.


## Cloudflare Pages deployment

1. Push these files to `Jimbib85/History` on the `main` branch.
2. In Cloudflare Workers & Pages, create a Pages project and connect `Jimbib85/History`.
3. Framework preset: None; build command: leave blank; output directory: `/` (repository root).
4. After the initial deployment, under Custom domains add `history.bibbybots.ai`. Cloudflare will guide you through the DNS record and certificate.
5. Subsequent pushes to `main` redeploy automatically.

The app is entirely static and does not require environment variables.

## Version 0.2: Content and comparative technology tree

The atlas now includes **61 societies and communities**, **51 historical events**, and **12 technology topics with 42 dated examples**. The collection covers early farming communities, the Caral–Supe region, Bronze Age states, Sasanian Iran, Srivijaya, Song China, Goryeo Korea, the Swahili coast, Cahokia, the Kingdom of Benin and more.

Select **Technology tree** from the top bar. Choose any historical society and a technology such as papermaking, iron production, writing, navigation or movable type. The viewer compares selected dated evidence among societies and provides links to background sources. Use **Explore this year** to jump back to the main historical map. The tree has its own Random technology button.

The technology diagram deliberately avoids a false technology ladder: adoption, independent development and further refinement are distinct. Dates are approximate evidence points, not claims of exclusive invention. A society without a milestone is simply not documented in this small dataset.

Files: `public/tech-data.js`, `public/technology-tree.js`, `public/technology-tree.css`. Content expansions live in `public/data.js`. Run `npm test` for chronology and content-reference checks.

The repository currently has `wrangler.jsonc` configured for Cloudflare Workers static asset hosting from `./public`, not the repository root. It is a personal passion project, with no login, advertising, database or subscriptions.
