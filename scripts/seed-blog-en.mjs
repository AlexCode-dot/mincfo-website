/**
 * Creates English (`locale: "en"`) variants of the Swedish blog posts.
 *
 * Source of truth for the English copy is scripts/blog-en-translations.json,
 * keyed by the Swedish document _id. For each SV post we deep-copy the
 * Portable Text body and replace each block's text with the translated
 * string (matched by block _key), preserving structure, styles, list items,
 * images and all non-text fields. The EN doc gets _id `${id}-en`,
 * `locale: "en"` and the SAME slug (the detail query is locale-aware).
 *
 * The script REFUSES to write a post whose translation is incomplete, so it
 * is safe to run while translations are still being filled in.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "../.env.local");
try {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i);
    if (!process.env[k]) process.env[k] = t.slice(i + 1);
  }
} catch {}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
  console.error("Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const translations = JSON.parse(
  readFileSync(resolve(__dirname, "blog-en-translations.json"), "utf-8"),
);

function translateBody(body, blockMap, slug) {
  const missing = [];
  const out = (body ?? []).map((block) => {
    if (block._type !== "block") return block; // images etc. — keep as-is
    const text = (block.children ?? []).map((c) => c.text ?? "").join("");
    if (!text.trim()) return block; // empty spacer block — keep as-is
    const en = blockMap[block._key];
    if (en === undefined || en === null || `${en}`.trim() === "") {
      missing.push(block._key);
      return block;
    }
    // Preserve block style / listItem / level / _key; replace children with a
    // single translated span. (Inline marks are intentionally flattened —
    // these articles use whole-span emphasis at most.)
    return {
      _type: "block",
      _key: block._key,
      style: block.style ?? "normal",
      ...(block.listItem ? { listItem: block.listItem, level: block.level ?? 1 } : {}),
      markDefs: [],
      children: [{ _type: "span", _key: `${block._key}-0`, text: en, marks: [] }],
    };
  });
  if (missing.length > 0) {
    throw new Error(
      `Incomplete translation for "${slug}": ${missing.length} block(s) missing: ${missing.join(", ")}`,
    );
  }
  return out;
}

async function run() {
  const svDocs = await client.fetch(
    `*[_type=="blogPost" && !(_id in path("drafts.**")) && coalesce(locale,"sv")=="sv"]|order(publishedAt desc)`,
  );

  let written = 0;
  let skipped = 0;

  for (const doc of svDocs) {
    const t = translations[doc._id];
    if (!t || t.skip) {
      console.log(`SKIP ${doc.slug} (no translation entry yet)`);
      skipped++;
      continue;
    }

    let body;
    try {
      body = translateBody(doc.body, t.blocks ?? {}, doc.slug);
    } catch (err) {
      console.error(`ABORT ${doc.slug}: ${err.message}`);
      skipped++;
      continue;
    }

    const enDoc = {
      ...doc,
      _id: `${doc._id}-en`,
      locale: "en",
      title: t.title ?? doc.title,
      eyebrow: t.eyebrow ?? doc.eyebrow,
      excerpt: t.excerpt ?? doc.excerpt,
      seoTitle: t.seoTitle ?? doc.seoTitle,
      seoDescription: t.seoDescription ?? doc.seoDescription,
      body,
    };
    delete enDoc._rev;
    delete enDoc._createdAt;
    delete enDoc._updatedAt;

    await client.createOrReplace(enDoc);
    console.log(`OK   ${doc.slug} -> ${enDoc._id}`);
    written++;
  }

  console.log(`\nDone. ${written} written, ${skipped} skipped.`);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
