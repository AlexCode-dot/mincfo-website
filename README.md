# MinCFO Website

## Development

```bash
npm run dev
```

## Content Workflow (Google Docs <-> Site)

Source of truth in repo:
- `src/content/homePageText.json`
- `src/content/solutionPagesText.json`

Export current site content to Google Docs:

```bash
npm run content:export:gdocs
```

Import edited content from Google Docs back to repo:

```bash
npm run content:import:gdocs
```

Then commit + deploy.

## Required env vars

In `.env.local`:
- `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` (or `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`)
- `GOOGLE_DOC_ID_MAIN`
- `GOOGLE_DOC_ID_SOLUTIONS`
