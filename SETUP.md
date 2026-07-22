# Firebase setup and deployment

This guide sets up a new VAMOS deployment with Firebase Hosting and optional Google Analytics. Run Firebase commands from the repository root, beside `firebase.json`.

## 1. Create the Firebase project

1. Open the [Firebase console](https://console.firebase.google.com/) and choose **Add project**.
2. Choose the project ID carefully. It is globally unique, cannot be changed after creation, and appears in the default Hosting URLs.
3. Enable Google Analytics during project creation if the site will use Analytics. It can also be enabled later under **Project settings → Integrations**.
4. Finish creating the project.

For separate production and staging data, create separate Firebase projects. This makes accidental cross-environment deployments less likely.

## 2. Register the web app

In the Firebase project:

1. Open **Project settings → General**.
2. Under **Your apps**, choose the Web icon (`</>`).
3. Enter a recognizable app nickname.
4. Register the app. Checking **Also set up Firebase Hosting** is optional; the CLI steps below configure Hosting as well.
5. Keep the displayed Firebase configuration available for the Analytics step.

The values named `apiKey`, `projectId`, `appId`, and `measurementId` identify the browser app. They are not Firebase Admin credentials, but API restrictions and Firebase security rules still need to be configured appropriately. Never add service-account JSON or private keys to this repository.

## 3. Install and authenticate the Firebase CLI

Install the CLI once if it is not already available:

```sh
npm install --global firebase-tools
firebase login
firebase projects:list
```

`firebase projects:list` confirms that the signed-in account can access the new project.

## 4. Select the Firebase project

This repository already contains the correct Hosting rules in `firebase.json`. To point a fresh checkout or copied site at another Firebase project, add a local project alias:

```sh
firebase use --add
```

Select the new project and name the alias `default` when this repository has only one deployment environment. Verify the selection before every first deployment:

```sh
firebase use
```

This updates `.firebaserc`. For a one-off command, select the target explicitly instead of changing the active alias:

```sh
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

### Initializing Hosting from scratch

If starting from a directory that does not yet have `firebase.json`, run:

```sh
firebase init hosting
```

Choose:

- **Use an existing project**, then select the Firebase project created above.
- Public directory: `dist`
- Configure as a single-page app: **Yes**
- Set up automatic GitHub deploys: choose according to the project workflow; it is not required for manual deployments.
- Do not overwrite an existing `index.html` if prompted.

The resulting Hosting section should be equivalent to:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Do not casually rerun `firebase init` in an established project: initialization can replace an existing service section in `firebase.json`.

## 5. Configure the new VAMOS site

Update these files before building:

- `public/index.site.json`: locale, direction, date formats, site name, map, onboarding video, and Analytics.
- `public/index.language.json`: translated UI copy.
- `public/index.data.json`: events and locations.
- `public/images/events/`: event images referenced by the data.
- `public/favicon.svg` and `public/apple-touch-icon.png`: site identity.
- `public/privacy.md` and `public/terms.md`: policies for the deployment.
- `.env`: API, Google Maps, access-gate, and feature-flag values.

Create `.env` if the new checkout does not have one. Use deployment-specific values rather than copying credentials blindly:

```dotenv
VITE_API=https://YOUR_API_BASE_URL
VITE_MAP_KEY=YOUR_RESTRICTED_BROWSER_MAPS_KEY
VITE_HASH=YOUR_OPTIONAL_ACCESS_GATE_VALUE
VITE_LIGHTBOX_DETAILS=true
VITE_LIGHTBOX_DETAILS_MOBILE=true
```

All `VITE_` variables are embedded in the client bundle and are visible to visitors. They must never contain server-side secrets.

At minimum, review the site-specific values in `index.site.json`:

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

## 6. Enable Analytics

If Analytics was not enabled while creating the project, open **Project settings → Integrations**, find Google Analytics, and enable it. Register a web app as described above if one does not already exist.

Copy the browser configuration values from **Project settings → General → Your apps → SDK setup and configuration** into the `analytics` object in `public/index.site.json`:

```json
{
  "analytics": {
    "enabled": true,
    "firebase": {
      "apiKey": "YOUR_WEB_API_KEY",
      "projectId": "YOUR_PROJECT_ID",
      "appId": "YOUR_APP_ID",
      "measurementId": "G-XXXXXXXXXX"
    }
  }
}
```

Use the values from the same registered Firebase web app; do not mix configurations from different projects. To disable collection for a site, set `enabled` to `false`.

Analytics is initialized only in a production build. It intentionally remains off under `pnpm dev` and staging-mode builds. To test the real production behavior locally:

```sh
pnpm build
pnpm preview
```

Then visit `http://localhost:3001`. Confirm events in Google Analytics Realtime, allowing for setup and reporting delays and checking that a browser extension is not blocking Analytics. DebugView is also available after enabling Analytics debug mode in the test browser.

The application also supports a browser-local opt-out:

- Add `?analytics=off` once to opt that browser out and remove the query parameter.
- Add `?analytics=on` once to opt it back in.

The preference is stored in local storage for that browser.

## 7. Build and verify

Install exactly the versions recorded in the lockfile and build the static site:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Before deployment, check:

- The site opens at `http://localhost:3001` without console errors.
- Directly opening a nested route works.
- Event images, favicon, and Apple touch icon load.
- Dates, times, and text direction match the selected language.
- Map links and map rendering work with the deployed domain's API-key restrictions.
- Privacy and terms content is correct.

Stop the preview server when verification is complete.

## 8. Preview or deploy Hosting

For a temporary Firebase preview URL:

```sh
firebase hosting:channel:deploy preview
```

For the live site:

```sh
firebase use
firebase deploy --only hosting
```

The default site is available at:

- `https://YOUR_PROJECT_ID.web.app`
- `https://YOUR_PROJECT_ID.firebaseapp.com`

A custom domain can be connected from **Firebase console → Hosting → Add custom domain**. Follow the ownership and DNS instructions shown for that domain.

### Additional Hosting site in one Firebase project

Most VAMOS deployments should use one Firebase project and its default Hosting site. If multiple sites must share one Firebase project, create and target an additional Hosting site:

```sh
firebase hosting:sites:create YOUR_SITE_ID --app YOUR_FIREBASE_WEB_APP_ID
firebase target:apply hosting YOUR_TARGET_NAME YOUR_SITE_ID
```

Then change `firebase.json` from a single Hosting object to a target entry, preserving the same `public`, `ignore`, and `rewrites` values:

```json
{
  "hosting": [
    {
      "target": "YOUR_TARGET_NAME",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

Deploy only that target with:

```sh
firebase deploy --only hosting:YOUR_TARGET_NAME
```

## Troubleshooting

### The deployment went to the wrong project

Run `firebase use` before deploying, inspect `.firebaserc`, or pass `--project YOUR_PROJECT_ID` explicitly.

### Direct URLs return 404

Confirm that `firebase.json` contains the `**` rewrite to `/index.html`, then rebuild and redeploy.

### Analytics shows no activity

Confirm all of the following:

- `analytics.enabled` is `true`.
- The four Firebase values belong to the registered web app being deployed.
- The application was built in production mode with `pnpm build`.
- The current browser was not opted out with `?analytics=off`.
- Content blockers are disabled while testing.
- Analytics is enabled in the Firebase project's Integrations settings.

### Local content differs from the deployed site

Firebase deploys `dist/`, not `public/` directly. Run `pnpm build` immediately before `firebase deploy --only hosting` and verify the new production bundle with `pnpm preview`.

## Current VAMOS Portugal target

This repository currently has:

- Firebase default project: `vamos-portugal`
- Hosting output: `dist`
- SPA fallback: all routes rewrite to `/index.html`
- Analytics: present in site configuration but disabled until valid web-app values are supplied and `enabled` is set to `true`

Relevant official references: [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart), [Firebase CLI reference](https://firebase.google.com/docs/cli), and [Google Analytics for web setup](https://firebase.google.com/docs/analytics/web/get-started).
