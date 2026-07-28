# salonambientu.pl

One-page site for the **Salony Ambientu** event series. Astro + Tailwind v4, fully static.

## Dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/ (static)
```

## Editing events

Add/edit one YAML file per event in `src/content/events/`. Schema in
`src/content.config.ts`. Past events drop off automatically (filtered by `date`).
The soonest upcoming event sets the default/mobile background color.

Fields: `id`, `city`, `title`, `edition?`, `date`, `time`, `venue`, `address?`,
`artists[]`, `organizers?[]`, `fbUrl`, `colorTheme` (`warszawa|poznan|katowice`).

## The re-themable background

`src/components/PosterBackground.astro` is a fixed layered-SVG key visual (pill +
glow + frame + gradient). Colors per city live in `src/lib/themes.ts`. Hovering an
event on desktop re-themes the background; mobile stays on the soonest event's theme.

## TODO before launch (needs client assets)

- **Adobe font**: paste the Typekit kit ID into `TYPEKIT_KIT_ID` in
  `src/layouts/Layout.astro`. Until set, the site uses the self-hosted Inter Tight
  fallback.
- **Facebook URLs**: replace the placeholder `fbUrl` values in the event YAML.
- **Logos**: drop files in `public/logos/` and wire them in
  `src/components/Footer.astro`.
