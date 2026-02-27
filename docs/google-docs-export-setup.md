# Google Docs setup

Detta repo använder Google Docs som redigeringsyta för innehåll.

## Source of truth i repo

- `src/content/homePageText.json`
- `src/content/solutionPagesText.json`

## 1. Google Cloud

1. Skapa/välj projekt i Google Cloud.
2. Aktivera:
   - Google Docs API
   - Google Drive API
3. Skapa Service Account.
4. Skapa JSON-nyckel och spara lokalt (t.ex. `.secrets/gdocs-service-account.json`).

## 2. Miljövariabler (`.env.local`)

```bash
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=.secrets/gdocs-service-account.json
GOOGLE_DOC_ID_MAIN=<doc-id>
GOOGLE_DOC_ID_SOLUTIONS=<doc-id>
```

## 3. Export till Google Docs

```bash
npm run content:export:gdocs
```

## 4. Import från Google Docs tillbaka till repo

```bash
npm run content:import:gdocs
```

Importen skriver tillbaka till JSON-filerna ovan.
