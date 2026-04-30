/**
 * Raderar ALLA blogPost-dokument i Sanity.
 *
 * Kör:   npm run content:clean:blog
 *
 * VARNING: detta raderar allt blogginnehåll, även riktigt publicerade inlägg.
 * Tänk efter innan du kör.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // ingen .env.local
}

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
  console.error(
    "Saknar env vars. Sätt NEXT_PUBLIC_SANITY_PROJECT_ID och SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function clean() {
  const existing = await client.fetch(`*[_type == "blogPost"]{ _id, title }`);

  if (existing.length === 0) {
    console.log("Inga blogPost-dokument hittades. Inget att rensa.");
    return;
  }

  console.log(`Hittade ${existing.length} blogPost-dokument:`);
  for (const doc of existing) {
    console.log(`  - ${doc._id}  (${doc.title ?? "<utan titel>"})`);
  }

  console.log(`\nRaderar…`);
  const tx = client.transaction();
  for (const doc of existing) tx.delete(doc._id);
  await tx.commit();
  console.log(`Klart. ${existing.length} dokument raderade.`);
}

clean().catch((err) => {
  console.error("Clean failed:", err);
  process.exit(1);
});
