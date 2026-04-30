/**
 * Seedar fake blogginlägg i Sanity för design-testing.
 *
 * Använd via combo-kommandona i package.json:
 *   npm run content:fake:blog:with-images   – rensar + seedar med Picsum-bilder
 *   npm run content:fake:blog:no-images     – rensar + seedar utan bilder
 *
 * Sätt SEED_BLOG_NO_IMAGES=1 för att hoppa över bildladdning. Alla test-inlägg
 * har slug-prefix "test-" och rensas av clean-blog.mjs vid varje körning.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ladda .env.local
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
  // ingen .env.local — förlita på existerande env vars
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

const SKIP_IMAGES = process.env.SEED_BLOG_NO_IMAGES === "1";

// ── Helpers för Portable Text ──────────────────────────────────────────────

let _keyCounter = 0;
const k = () => `k${++_keyCounter}`;

const span = (text, marks = []) => ({
  _type: "span",
  _key: k(),
  text,
  marks,
});

const para = (...spans) => ({
  _type: "block",
  _key: k(),
  style: "normal",
  markDefs: [],
  children: spans,
});

const heading = (level, text) => ({
  _type: "block",
  _key: k(),
  style: level,
  markDefs: [],
  children: [span(text)],
});

const bullet = (text) => ({
  _type: "block",
  _key: k(),
  style: "normal",
  markDefs: [],
  listItem: "bullet",
  level: 1,
  children: [span(text)],
});

const quote = (text) => ({
  _type: "block",
  _key: k(),
  style: "blockquote",
  markDefs: [],
  children: [span(text)],
});

// ── Bilduppladdning (valfritt) ────────────────────────────────────────────

async function uploadCover(seed) {
  if (SKIP_IMAGES) return null;
  const url = `https://picsum.photos/seed/${seed}/1600/900`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload("image", buffer, {
      filename: `${seed}.jpg`,
    });
    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (err) {
    console.warn(`  bildladdning misslyckades för ${seed}:`, err.message);
    return null;
  }
}

// ── Fake-data ─────────────────────────────────────────────────────────────

const POSTS = [
  {
    slug: "test-ai-andrar-ekonomistyrning",
    title: "Så ändrar AI hur svenska bolag styr sin ekonomi",
    eyebrow: "Insikter",
    excerpt:
      "Från eftersläpande månadsbokslut till realtidsprognoser – här är vad förändras när AI får en plats i ekonomifunktionen.",
    publishedAt: "2026-04-22T08:00:00.000Z",
    featured: true,
    author: "Victor Söderqvist",
    authorRole: "Founder, MinCFO",
    readingTime: 6,
    body: [
      para(
        span(
          "Under det senaste året har vi sett en tydlig förändring i hur svenska tillväxtbolag tänker kring sin ekonomifunktion. Det handlar inte längre bara om att stänga månaden snabbare – det handlar om att kunna fatta beslut med samma data som ledningen sitter på, just nu.",
        ),
      ),
      heading(
        "h2",
        "Från eftersläpande rapporter till realtid",
      ),
      para(
        span(
          "Den traditionella ekonomicykeln är byggd kring månadsbokslut. Du får svar på vad som hände för tre veckor sedan, paketerat i en PDF. Det är som att köra bil genom att titta i backspegeln.",
        ),
      ),
      para(
        span(
          "Med AI-driven automation och direktintegrationer mot Fortnox, banker och lönesystem kan vi istället arbeta i en helt annan tempo:",
        ),
      ),
      bullet("Kassaflödet uppdateras dagligen, inte månadsvis"),
      bullet("Avvikelser flaggas innan de blir problem"),
      bullet("Prognoser som faktiskt speglar vad som händer"),
      heading("h2", "Vad det betyder för CFO-rollen"),
      para(
        span(
          "Den moderna CFO:n är inte längre en rapportör. Hen är en strateg med data i realtid. AI tar hand om dataaggregeringen och avstämningarna; människan fokuserar på tolkning, scenarier och beslut.",
        ),
      ),
      quote(
        "Vi gick från att stänga månaden på dag 12 till att ha rullande siffror varje morgon. Det förändrade hur vi pratar i ledningen.",
      ),
      heading("h3", "Tre saker att börja med"),
      para(
        span("Om du vill ta steget mot en mer modern ekonomifunktion – börja här:"),
      ),
      bullet("Koppla bokföringen direkt till en realtidsplattform"),
      bullet("Automatisera avstämningarna mot bank"),
      bullet("Sätt upp en handfull KPI:er som teamet följer dagligen"),
      para(
        span(
          "Det är inte raketforskning, men kombinationen av rätt data, rätt verktyg och en tydlig rytm är det som skapar förändringen.",
        ),
      ),
    ],
  },
  {
    slug: "test-fem-tecken-cfo",
    title: "5 tecken på att ditt bolag behöver en CFO",
    eyebrow: "Guide",
    excerpt:
      "Du behöver inte vara ett 100-personersbolag för att tjäna på en finansfunktion på riktigt. Så här vet du att det är dags.",
    publishedAt: "2026-04-15T08:00:00.000Z",
    author: "Anna Lundberg",
    authorRole: "Head of Finance Advisory",
    readingTime: 4,
    body: [
      para(
        span(
          "Många founders väntar för länge med att ta in finansiell kompetens. Resultatet blir att stora beslut – kring kassaflöde, prissättning och investeringar – tas på magkänsla istället för data. Här är fem signaler på att du har växt ur Excel-stadiet.",
        ),
      ),
      heading("h2", "1. Du vet inte exakt vad runwayen är"),
      para(
        span(
          "Om frågan ”hur länge räcker pengarna” kräver mer än fem minuter att svara på är det en första varningsklocka.",
        ),
      ),
      heading("h2", "2. Månadsbokslutet kommer för sent"),
      para(
        span(
          "När siffrorna landar dag 15 är de redan inaktuella. Det skapar en kultur där ekonomin är något man tittar på, inte något man styr med.",
        ),
      ),
      heading("h2", "3. Du har börjat anställa snabbare"),
      para(
        span(
          "Personalkostnaden är den enskilt största hävstången i de flesta tjänstebolag. Utan en finansiell partner som kan prognostisera blir varje anställning ett kliv i mörker.",
        ),
      ),
      heading("h2", "4. Investerare börjar ställa svåra frågor"),
      para(
        span(
          "När du går in i en kapitalrunda förändras spelet. Du behöver kunna svara snabbt på unit economics, CAC payback och bruttomarginalsutveckling – med data du litar på.",
        ),
      ),
      heading("h2", "5. Du fattar beslut på magkänsla"),
      para(
        span(
          "Magkänsla är värdefull, men inte som enda underlag. När viktiga beslut hela tiden tas utan siffror i botten är det ett tecken på att finansfunktionen behöver lyftas.",
        ),
      ),
      para(
        span(
          "Lösningen behöver inte vara en heltidsanställd CFO. Med rätt verktyg och en bra finansiell partner kan du nå 80 % av värdet till en bråkdel av kostnaden.",
        ),
      ),
    ],
  },
  {
    slug: "test-fran-excel-till-realtid",
    title: "Från Excel till realtid: framtidens månadsbokslut",
    eyebrow: "Produkt",
    excerpt:
      "Hur månadsbokslutet ser ut när det är något du läser av varje morgon istället för att vänta tre veckor på.",
    publishedAt: "2026-04-08T08:00:00.000Z",
    author: "Victor Söderqvist",
    authorRole: "Founder, MinCFO",
    readingTime: 5,
    body: [
      para(
        span(
          "Månadsbokslutet är en av de mest seglivade traditionerna i ekonomivärlden. Men det finns ingen lag som säger att finansiell rapportering behöver komma en gång i månaden, paketerat i en statisk PDF.",
        ),
      ),
      heading("h2", "Vad blir annorlunda?"),
      para(
        span(
          "I en realtidsmodell flyttar vi tyngdpunkten från sammanställning till tolkning. Avstämningar och periodisering sker löpande, automatiskt. Det som är kvar är de roliga frågorna:",
        ),
      ),
      bullet("Varför ökar våra personalkostnader procentuellt mer än omsättningen?"),
      bullet("Vad händer med bruttomarginalen om vi höjer priserna 8 %?"),
      bullet("Hur ser kassan ut om vi anställer två säljare till i Q3?"),
      heading("h2", "Förutsättningarna"),
      para(
        span(
          "Det här kräver tre saker: bra integrationer (så datan kommer in löpande), en motor som klarar av att normalisera och periodisera den, och ett gränssnitt där människor kan ställa frågor och få svar.",
        ),
      ),
      quote(
        "Vi sparar runt 30 timmar per månad på avstämningar – tid som vi nu lägger på faktisk analys istället.",
      ),
    ],
  },
  {
    slug: "test-fortnox-integration",
    title: "Varför Fortnox-integration är en game-changer för småbolag",
    eyebrow: "Produkt",
    excerpt:
      "En direkt koppling mellan bokföringen och resten av ditt finansiella ekosystem är inte en ”nice-to-have” – det är skillnaden mellan reaktiv och proaktiv styrning.",
    publishedAt: "2026-03-28T08:00:00.000Z",
    author: "Anna Lundberg",
    authorRole: "Head of Finance Advisory",
    readingTime: 3,
    body: [
      para(
        span(
          "Fortnox är ryggraden i tusentals svenska småbolag. Problemet är inte verktyget – problemet är att data fastnar där. Den behöver lyftas ur, kombineras med bankdata, lönesystem och försäljningsdata för att bli faktiskt användbar.",
        ),
      ),
      heading("h2", "Vad direktintegration löser"),
      bullet("Inga manuella exports eller CSV-filer"),
      bullet("Realtidsdata i ditt dashboard, inte gårdagens"),
      bullet("Avstämningar som sker automatiskt över natten"),
      para(
        span(
          "Resultatet är en ekonomifunktion där tiden går till analys och beslut, inte till att flytta data mellan system.",
        ),
      ),
    ],
  },
  {
    slug: "test-cashflow-prognoser-ai",
    title: "Cash flow-prognoser med AI – så funkar det",
    eyebrow: "Insikter",
    excerpt:
      "AI förändrar inte vad en kassaflödesprognos är – men den förändrar drastiskt hur ofta du kan göra om den och hur exakt den blir.",
    publishedAt: "2026-03-20T08:00:00.000Z",
    author: "Victor Söderqvist",
    authorRole: "Founder, MinCFO",
    readingTime: 7,
    body: [
      para(
        span(
          "Den klassiska kassaflödesprognosen byggs i Excel, en gång i månaden, av någon som har sammanställt data från fem olika system. När den är klar är den redan delvis inaktuell.",
        ),
      ),
      heading("h2", "Vad AI tillför"),
      para(
        span(
          "Med en realtidsmotor som kontinuerligt läser in transaktioner och har sett hur ditt bolag betett sig historiskt kan vi göra två saker bättre:",
        ),
      ),
      bullet("Uppdatera prognosen automatiskt varje natt"),
      bullet("Justera baseline efter sässongsvariationer som modellen lärt sig"),
      bullet("Räkna fram konsekvenser av scenarier på sekunder"),
      heading("h2", "Tre nivåer av prognos"),
      heading("h3", "Baseline"),
      para(
        span(
          "Modellen kombinerar historiska mönster med kända kommande in- och utbetalningar. Det är din ”allt-fortsätter-som-vanligt”-prognos.",
        ),
      ),
      heading("h3", "Scenario"),
      para(
        span(
          "Du kan fråga: ”Vad händer om vi anställer två till i juni och tappar vår största kund i augusti?” Modellen räknar om hela kurvan på en sekund.",
        ),
      ),
      heading("h3", "Tidiga varningar"),
      para(
        span(
          "Om något i din verkliga data avviker från modellens förväntan – t.ex. längre betaltider eller en oväntad personalkostnad – får du en signal direkt, inte tre veckor senare.",
        ),
      ),
      quote(
        "Vi upptäckte att en av våra största kunder börjat betala 14 dagar senare. Modellen flaggade det innan vi själva hade sett det.",
      ),
      para(
        span(
          "Det är inte AI som tar besluten. Men det är AI som ger dig tiden och datan att fatta dem rätt.",
        ),
      ),
    ],
  },
  {
    slug: "test-manadsbokslut-pa-fem-dagar",
    title: "Så stänger vi månadsbokslutet på 5 dagar – varje gång",
    eyebrow: "Guide",
    excerpt:
      "Steg-för-steg-rutinen vi använder för att gå från sista i månaden till färdigt bokslut – utan stress.",
    publishedAt: "2026-03-12T08:00:00.000Z",
    author: "Anna Lundberg",
    authorRole: "Head of Finance Advisory",
    readingTime: 5,
    body: [
      para(
        span(
          "Om månadsbokslutet är något som kommer som en överraskning varje månad gör du fel. Här är rutinen vi använder hos våra kunder för att stänga konsekvent på fem arbetsdagar.",
        ),
      ),
      heading("h2", "Förarbetet (löpande under månaden)"),
      bullet("Bankavstämningar dagligen – aldrig vänta till månadsskiftet"),
      bullet("Leverantörsfakturor scannas in löpande"),
      bullet("Lönerelaterade poster periodiseras automatiskt"),
      heading("h2", "Dag 1–2: Datakontroll"),
      para(
        span(
          "Första två dagarna handlar om att säkerställa att allt material är på plats. Inga utlägg som hänger, inga ofakturerade timmar.",
        ),
      ),
      heading("h2", "Dag 3–4: Periodisering & avstämning"),
      para(
        span(
          "Här går vi igenom periodiseringar, prepayments och accruals. AI flaggar avvikelser mot förra månaden så vi vet vad vi ska titta på.",
        ),
      ),
      heading("h2", "Dag 5: Rapport & insights"),
      para(
        span(
          "Sista dagen handlar om att paketera siffrorna och förklara dem för ledningen. Inte bara ”så här blev det” – utan ”här är vad vi ska göra åt det”.",
        ),
      ),
    ],
  },
  {
    slug: "test-vi-vaxer-team",
    title: "Vi växer teamet – och söker en CFO Advisor",
    eyebrow: "Företaget",
    excerpt:
      "Efter ett år av snabb tillväxt utökar vi rådgivningsteamet med en ny senior CFO Advisor. Här är vad rollen innebär.",
    publishedAt: "2026-03-05T08:00:00.000Z",
    author: "Victor Söderqvist",
    authorRole: "Founder, MinCFO",
    readingTime: 2,
    body: [
      para(
        span(
          "MinCFO har vuxit snabbare än vi vågat hoppas på det senaste året. Vi har gått från 12 till 47 kunder, från ett team på fyra till nio – och vi har inga planer på att stanna upp.",
        ),
      ),
      heading("h2", "Det vi söker"),
      para(
        span(
          "Vi söker dig som har 8+ års erfarenhet från ekonomi- eller CFO-roller, gärna i tillväxtbolag. Du gillar att jobba nära ledning, är skicklig på att förenkla det komplexa, och tror på att teknik kan göra ekonomi mer värdeskapande – inte mindre mänsklig.",
        ),
      ),
      heading("h2", "Det vi erbjuder"),
      bullet("En central roll i ett av Sveriges snabbast växande fintech-bolag"),
      bullet("Ett kollektiv av extremt vassa kollegor"),
      bullet("Frihet att forma rollen efter dina styrkor"),
      para(
        span(
          "Läs mer och ansök på vår karriärsida – eller skicka ett mail direkt till mig så bjuder jag på kaffe.",
        ),
      ),
    ],
  },
  {
    slug: "test-runway-myten",
    title: "Myten om runway: varför 18 månader inte är ett magiskt tal",
    eyebrow: "Insikter",
    excerpt:
      "”Vi har 18 månaders runway” är ett av de mest överanvända – och minst användbara – siffrorna i startupvärlden. Här är vad du borde fokusera på istället.",
    publishedAt: "2026-02-26T08:00:00.000Z",
    author: "Victor Söderqvist",
    authorRole: "Founder, MinCFO",
    readingTime: 6,
    body: [
      para(
        span(
          "Säg ”18 månader runway” på en investerarmiddag och alla nickar instämmande. Men runway som ett enskilt tal är nästan alltid missvisande. Här är varför.",
        ),
      ),
      heading("h2", "Problemet med ett enda tal"),
      para(
        span(
          "En runway-siffra antar att din burn-rate är konstant. Men ditt bolag är inte en konstant. Säljcykeln rör sig, kostnader hoppar i steg när du anställer, och intäkterna kommer sällan i raka linjer.",
        ),
      ),
      heading("h2", "Tre tal som är mer användbara"),
      heading("h3", "Net burn nu"),
      para(
        span(
          "Hur mycket pengar har du faktiskt förlorat de senaste 30 dagarna? Inte föregående kvartal, inte rullande tre månader – nu.",
        ),
      ),
      heading("h3", "Trended burn"),
      para(
        span(
          "Hur har burn rörts under de senaste 6 månaderna? Stiger den, sjunker den, eller skiftar den oförutsägbart?",
        ),
      ),
      heading("h3", "Scenario-runway"),
      para(
        span(
          "Givet tre olika antaganden om kommande tillväxt och kostnader – hur lång är runwayen då? Det här är talet som faktiskt påverkar dina beslut.",
        ),
      ),
      quote(
        "Vi slutade rapportera runway som en siffra. Vi rapporterar tre scenarier istället. Det förändrade hur ledningen tänker.",
      ),
      heading("h2", "Vad det här betyder för dig"),
      para(
        span(
          "Sluta sikta på att maximera ”månader runway”. Börja sikta på att förstå dina drivers så väl att du kan förändra burn rate i veckor – inte kvartal – när du behöver.",
        ),
      ),
    ],
  },
  {
    slug: "test-ai-hallucinerar-finans",
    title: "Vad gör vi när AI:n hallucinerar i finansdata?",
    eyebrow: "Produkt",
    excerpt:
      "Det går inte att bygga en AI-driven CFO utan att ta hallucinationer på allvar. Här är hur vi tänker kring träffsäkerhet, granskning och ansvar.",
    publishedAt: "2026-02-15T08:00:00.000Z",
    author: "Victor Söderqvist",
    authorRole: "Founder, MinCFO",
    readingTime: 8,
    body: [
      para(
        span(
          "När vi pratar med blivande kunder kommer frågan ofta upp tidigt: ”Hur kan vi lita på AI:n om den hittar på saker?” Det är en helt rätt fråga – och vårt svar är att vi inte litar på AI:n. Vi designar runt den.",
        ),
      ),
      heading("h2", "Tre lager av skydd"),
      heading("h3", "1. Datalager: AI:n får aldrig hitta på siffror"),
      para(
        span(
          "All numerisk data hämtas direkt från strukturerade källor – Fortnox, banken, lönesystemet. AI:n får inte generera tal. Den får tolka, kommentera och föreslå – men aldrig hitta på.",
        ),
      ),
      heading("h3", "2. Granskningslager: en människa i loopen"),
      para(
        span(
          "Innan AI:ns analys når kunden går den genom en CFO Advisor som granskar logiken. Är resonemanget rimligt? Finns det något modellen missat?",
        ),
      ),
      heading("h3", "3. Spårbarhetslager: varje siffra är klickbar"),
      para(
        span(
          "Varje siffra i våra rapporter går att klicka sig ner till källtransaktionen. Du behöver aldrig ta något på tro – du kan alltid verifiera.",
        ),
      ),
      heading("h2", "Vad det betyder i praktiken"),
      para(
        span(
          "Vi får ofta höra ”men AI är väl snabbare än det här?” Visst, kortsiktigt. Men en AI som hallucinerar 1 % av tiden i finansdata är värdelös – för den 1 % du missar kan vara den siffran allting hänger på.",
        ),
      ),
      bullet("Strukturerad input – aldrig fri textinmatning av siffror"),
      bullet("Mänsklig granskning innan publicering"),
      bullet("Källkod-spårbarhet ner till varje transaktion"),
      para(
        span(
          "Det är så vi bygger en AI-driven CFO som du faktiskt kan lita på.",
        ),
      ),
    ],
  },
];

// ── Seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log(
    `Seedar ${POSTS.length} fake-blogginlägg${SKIP_IMAGES ? " (utan bilder)" : " (med bilder från Picsum)"}…\n`,
  );

  for (const post of POSTS) {
    const docId = `blogPost-${post.slug}`;
    process.stdout.write(`  ${docId}…`);

    const cover = await uploadCover(post.slug);

    await client.createOrReplace({
      _id: docId,
      _type: "blogPost",
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      publishedAt: post.publishedAt,
      published: true,
      featured: post.featured === true,
      author: post.author,
      authorRole: post.authorRole,
      readingTime: post.readingTime,
      eyebrow: post.eyebrow,
      excerpt: post.excerpt,
      ...(cover ? { coverImage: cover } : {}),
      body: post.body,
    });

    console.log(" klart");
  }

  console.log(`\nKlart! Öppna /blogg eller Studio → Blogg.`);
  console.log(`Alla testinlägg har slug-prefix "test-" – radera dem i Studio när du är klar.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
