# Interactive Seerah

A bilingual (English / বাংলা) interactive journey through the life of
Prophet Muhammad ﷺ — 42 events from his birth in Makkah to the Farewell
Sermon, plus a growth chart and a conversion tree.

Originally exported from Figma Make; since reworked.

## Running

```sh
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run typecheck  # types only
```

## Structure

```
src/app/
  data/events.ts          Ordered event ids — the single source of truth
  translations/           All EN/BN copy, keyed by event id
  pages/HomePage.tsx      The timeline
  components/             Navbar, hero, timeline card, charts, tree
  hooks/useThemeColors.ts Reads CSS tokens for Recharts
src/styles/
  theme.css               Colour tokens (light + dark), base layer, utilities
  fonts.css               Font role mapping
```

### Adding an event

1. Add the copy under `events` in **both** `en` and `bn` in
   `src/app/translations/translations.ts`.
2. Add its id to `EVENT_IDS` in `src/app/data/events.ts`, in chronological
   position.

The timeline, both navbar menus and the chart milestone links all derive
from that array. `npm run typecheck` fails if an id is missing copy.

## Theming

Every colour comes from the tokens in `src/styles/theme.css` — avoid
hardcoding Tailwind palette classes. Dark mode is the `.dark` class on
`<html>`, applied before first paint by the inline script in `index.html`.
