import { NextResponse } from "next/server";

const ORG_NR_RE = /^\d{6}-?\d{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;

// Simple in-memory rate limiter: max 5 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const ALLOWED_ORIGINS = [
  "https://mincfo.com",
  "https://www.mincfo.com",
  "http://localhost:3000",
];

interface SignupBody {
  company?: string;
  orgNr?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string; // honeypot
}

export async function POST(request: Request) {
  // Origin check
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Otillåten källa." }, { status: 403 });
  }

  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "För många försök. Vänta en stund och försök igen." },
      { status: 429 },
    );
  }

  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig request." }, { status: 400 });
  }

  // Honeypot — bots fill this in, humans never see it
  if (body.website) {
    // Silently accept so bots think it worked
    return NextResponse.json({ ok: true });
  }

  const { company, orgNr, name, email, phone } = body;

  if (!company?.trim() || company.trim().length > MAX_FIELD_LENGTH) {
    return NextResponse.json({ error: "Företagsnamn krävs (max 200 tecken)." }, { status: 400 });
  }
  if (!orgNr?.trim() || !ORG_NR_RE.test(orgNr.trim())) {
    return NextResponse.json(
      { error: "Ogiltigt organisationsnummer. Ange 10 siffror (XXXXXX-XXXX)." },
      { status: 400 },
    );
  }
  if (!name?.trim() || name.trim().length > MAX_FIELD_LENGTH) {
    return NextResponse.json(
      { error: "Kontaktperson krävs (max 200 tecken)." },
      { status: 400 },
    );
  }
  if (!email?.trim() || !EMAIL_RE.test(email.trim()) || email.trim().length > MAX_FIELD_LENGTH) {
    return NextResponse.json(
      { error: "Ogiltig e-postadress." },
      { status: 400 },
    );
  }
  if (phone && phone.trim().length > 30) {
    return NextResponse.json(
      { error: "Ogiltigt telefonnummer." },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.DISCORD_SIGNUP_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("DISCORD_SIGNUP_WEBHOOK_URL is not configured");
    return NextResponse.json(
      { error: "Registreringen kunde inte skickas. Försök igen senare." },
      { status: 500 },
    );
  }

  const discordPayload = {
    embeds: [
      {
        title: "Ny kontoregistrering",
        color: 0x3836cf,
        fields: [
          { name: "Företagsnamn", value: company.trim(), inline: true },
          { name: "Org.nummer", value: orgNr.trim(), inline: true },
          { name: "Kontaktperson", value: name.trim(), inline: false },
          { name: "E-post", value: email.trim(), inline: true },
          {
            name: "Telefon",
            value: phone?.trim() || "–",
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!res.ok) {
      console.error("Discord webhook failed:", res.status, await res.text());
      return NextResponse.json(
        { error: "Kunde inte skicka registreringen. Försök igen." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Discord webhook error:", err);
    return NextResponse.json(
      { error: "Kunde inte skicka registreringen. Försök igen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
