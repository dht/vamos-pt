# VAMOS Portugal

VAMOS Portugal is a static, mobile-friendly index of local events across the Setúbal District. This repository is the site-specific client: it supplies the content, language, location, branding, and Firebase configuration while the published [`index-site`](https://www.npmjs.com/package/index-site) package supplies the React application.

The entry point is intentionally small:

```ts
import { startIndexSite } from "index-site";

void startIndexSite();
```

## Requirements

- Node.js 22.12 or newer
- [pnpm](https://pnpm.io/installation)
- [Firebase CLI](https://firebase.google.com/docs/cli) only when previewing or deploying Firebase Hosting

## Local development

```sh
pnpm install
pnpm dev
```

The development server listens on `http://localhost:3001` and is available on the local network.

To produce and inspect a production build:

```sh
pnpm build
pnpm preview
```

The generated static site is written to `dist/`. `pnpm preview` serves it on `http://localhost:3001`.

## Project structure

| Path                          | Purpose                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/main.ts`                 | Starts the published `index-site` application.                                                 |
| `public/index.site.json`      | Site language, text direction, date formats, map position, video, and Analytics configuration. |
| `public/index.language.json`  | All site-specific interface copy and labels.                                                   |
| `public/index.data.json`      | Event and location data loaded by the application.                                             |
| `public/images/events/`       | Event artwork referenced by `index.data.json`.                                                 |
| `public/favicon.svg`          | Browser favicon.                                                                               |
| `public/apple-touch-icon.png` | Home-screen icon for Apple devices.                                                            |
| `public/privacy.md`           | Privacy policy shown by the application.                                                       |
| `public/terms.md`             | Terms of use shown by the application.                                                         |
| `.env`                        | Local Vite configuration. Values prefixed with `VITE_` are included in the browser bundle.     |
| `firebase.json`               | Firebase Hosting output directory and single-page-app rewrite.                                 |
| `.firebaserc`                 | The Firebase project selected by default.                                                      |

## Site configuration

Edit `public/index.site.json` for site-level settings:

```json
{
  "language": "en",
  "isRtl": false,
  "dateFormats": {
    "date": "dddd, LL",
    "time": "LT"
  },
  "siteName": "Setúbal District",
  "map": {
    "center": {
      "lat": 38.35,
      "lng": -8.85
    },
    "zoom": 9
  }
}
```

Date and time strings use [Day.js localized formats](https://day.js.org/docs/en/display/format#localized-formats). The `language` value selects the Day.js locale, and `isRtl` controls the document direction.

Keep human-facing UI text in `index.language.json`, not in the shared package. Keep event records and locations in `index.data.json`. Event image paths are public URLs such as `/images/events/example.webp`.

## Environment variables

The client currently recognizes these Vite variables:

| Variable                        | Purpose                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `VITE_API`                      | API base URL used when refreshing event data.                                                   |
| `VITE_MAP_KEY`                  | Browser key for Google Maps. Restrict it to the required APIs and site origins in Google Cloud. |
| `VITE_HASH`                     | Optional value used by the access gate.                                                         |
| `VITE_LIGHTBOX_DETAILS`         | Enables event details in the lightbox.                                                          |
| `VITE_LIGHTBOX_DETAILS_MOBILE`  | Overrides lightbox details behavior on mobile.                                                  |
| `VITE_SHOW_EVENT_TYPE_SELECTOR` | Enables the event-type selector when set.                                                       |

Do not put server credentials, Firebase Admin credentials, or private keys in a `VITE_` variable. Vite exposes these values to every visitor.

## Updating the application package

This standalone client consumes the published npm package rather than the foram workspace package:

```sh
pnpm update index-site
pnpm build
```

Commit the resulting `pnpm-lock.yaml` change after verifying the site. Package development itself happens in the foram monorepo, where the web client can continue to use workspace dependencies.

## Firebase

This checkout is currently configured to deploy `dist/` to the default Firebase project alias `vamos-portugal`. See [SETUP.md](./SETUP.md) for creating or selecting another Firebase project, enabling Hosting and Analytics, and deploying safely.
