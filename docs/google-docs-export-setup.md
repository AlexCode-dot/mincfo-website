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

# Ny struktur för startsidan: ett doc per version
GOOGLE_DOC_ID_HOME_PLATFORM=<doc-id>
GOOGLE_DOC_ID_HOME_FULL_SERVICE=<doc-id>
GOOGLE_DOC_ID_HOME_PARTNER=<doc-id>

# Lösningssidor: fortsatt ett enda samlat doc
GOOGLE_DOC_ID_SOLUTIONS=<doc-id>

# Legacy startsida: gammal samlingsdoc
# GOOGLE_DOC_ID_MAIN=<doc-id>
```

## 3. Export till Google Docs

```bash
npm run content:export:gdocs
```

Om ett nytt doc-id saknas vid export skapas dokumentet automatiskt och scriptet skriver ut vilket env-var du ska spara.

## 4. Import från Google Docs tillbaka till repo

```bash
npm run content:import:gdocs
```

Importen skriver tillbaka till JSON-filerna ovan.

Import stödjer:

- ny struktur för startsidan: tre docs (`plattform`, `helhetslösning`, `för byråer`)
- legacy startsida: ett enda `GOOGLE_DOC_ID_MAIN`
- lösningssidor: ett enda `GOOGLE_DOC_ID_SOLUTIONS`
