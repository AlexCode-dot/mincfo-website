# MinCFO Landing Page

## Content management: Sanity + JSON sync

All user-facing text must be managed through Sanity CMS with JSON files as fallback.
When adding or changing text content, ALL of the following must be updated:

1. **JSON file** (`src/content/home/shared.json` or variant JSONs) — the fallback values
2. **Sanity schema** (`src/sanity/schemas/siteSettings.ts` or `homeVariantContent.ts`) — defines the CMS fields
3. **Mapping function** (`src/sanity/lib/fetchHomeContent.ts`) — maps Sanity fields to the app's data shape
4. **Seed script** (`scripts/seed-sanity.mjs`) — seeds Sanity with JSON values
5. **Component** — must read text from content/shared props, never hardcode strings

### Sync commands

```bash
npm run content:seed:sanity      # Push: JSON → Sanity (after local text changes)
npm run content:pull:sanity      # Pull: Sanity → JSON (after someone edits in Studio)
npm run content:validate:sanity  # Verify Sanity matches JSON
```

### Rules

- NEVER hardcode user-facing text in components. Use content props from `useHomeOffering()` or passed via props.
- Sanity is the source of truth at runtime. JSON files are fallback if Sanity fetch fails.
- The `deepMerge` in `fetchHomeContent.ts` means Sanity values override JSON — any field not set in Sanity falls back to JSON.
- When removing fields: remove from schema, mapping, seed, and re-seed. The JSON field can stay for type safety.
