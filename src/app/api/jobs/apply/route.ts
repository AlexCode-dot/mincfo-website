import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;
const MAX_MOTIVATION_LENGTH = 500;
const MAX_CV_BYTES = 15 * 1024 * 1024;
const ALLOWED_CV_MIME = new Set([
  "application/pdf",
  "application/x-pdf",
]);

const FROM_ADDRESS = "MinCFO Karriär <team@mincfo.com>";

// Simple in-memory rate limiter: max 5 applications per IP per 15 minutes
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
  "http://localhost:3001",
];

function sanitize(value: FormDataEntryValue | null, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtmlBody(fields: {
  jobTitle: string;
  jobSlug: string;
  name: string;
  email: string;
  phone: string;
  motivation: string;
}): string {
  const motivationHtml = escapeHtml(fields.motivation).replace(/\n/g, "<br>");
  return `<!doctype html>
<html lang="sv">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f5f6fa;margin:0;padding:24px;color:#0f1424;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e7f1;">
      <div style="padding:24px 28px;border-bottom:1px solid #e4e7f1;background:#f9fafe;">
        <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6770a2;font-weight:600;">Ny ansökan</p>
        <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#0f1424;font-weight:640;">${escapeHtml(fields.jobTitle)}</h1>
      </div>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tbody>
          <tr>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;width:32%;color:#6770a2;font-size:13px;font-weight:600;">Namn</td>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#0f1424;font-size:14px;">${escapeHtml(fields.name)}</td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#6770a2;font-size:13px;font-weight:600;">E-post</td>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#0f1424;font-size:14px;">
              <a href="mailto:${escapeHtml(fields.email)}" style="color:#3836cf;text-decoration:none;">${escapeHtml(fields.email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#6770a2;font-size:13px;font-weight:600;">Telefon</td>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#0f1424;font-size:14px;">${escapeHtml(fields.phone || "–")}</td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#6770a2;font-size:13px;font-weight:600;">Roll</td>
            <td style="padding:16px 28px;border-bottom:1px solid #eef0f7;color:#0f1424;font-size:14px;">${escapeHtml(fields.jobTitle)}</td>
          </tr>
          <tr>
            <td style="padding:16px 28px;color:#6770a2;font-size:13px;font-weight:600;vertical-align:top;">Varför rollen?</td>
            <td style="padding:16px 28px;color:#0f1424;font-size:14px;line-height:1.6;">${motivationHtml}</td>
          </tr>
        </tbody>
      </table>
      <div style="padding:16px 28px;background:#f9fafe;border-top:1px solid #e4e7f1;color:#8a92b8;font-size:12px;">
        CV:t är bifogat som PDF i detta mail.
      </div>
    </div>
  </body>
</html>`;
}

function buildTextBody(fields: {
  jobTitle: string;
  jobSlug: string;
  name: string;
  email: string;
  phone: string;
  motivation: string;
}): string {
  return [
    `Ny ansökan – ${fields.jobTitle}`,
    "",
    `Namn:       ${fields.name}`,
    `E-post:     ${fields.email}`,
    `Telefon:    ${fields.phone || "–"}`,
    `Roll:       ${fields.jobTitle}`,
    "",
    "Varför just denna person?",
    fields.motivation,
    "",
    "CV:t är bifogat som PDF.",
  ].join("\n");
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function safeCvFilename(fullName: string, originalName: string): string {
  const extMatch = (originalName || "cv.pdf").match(/\.[a-zA-Z0-9]{1,5}$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : ".pdf";
  const base =
    fullName.replace(/[^a-zA-Z0-9åäöÅÄÖ_\- ]/g, "").replace(/\s+/g, "_") ||
    "ansokan";
  return `${base}_CV${ext}`;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Otillåten källa." }, { status: 403 });
  }

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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ogiltig request." }, { status: 400 });
  }

  // Honeypot — bots fill this in, humans never see it
  const honeypot = sanitize(form.get("website"), 10);
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const name = sanitize(form.get("name"), MAX_FIELD_LENGTH);
  const email = sanitize(form.get("email"), MAX_FIELD_LENGTH);
  const phone = sanitize(form.get("phone"), 30);
  const motivation = sanitize(form.get("motivation"), MAX_MOTIVATION_LENGTH);
  const jobSlug = sanitize(form.get("jobSlug"), 120);
  const jobTitle = sanitize(form.get("jobTitle"), MAX_FIELD_LENGTH);

  if (!name) {
    return NextResponse.json({ error: "Namn krävs." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Ogiltig e-postadress." }, { status: 400 });
  }
  if (!motivation) {
    return NextResponse.json(
      { error: "Beskriv kort varför du ska ha rollen." },
      { status: 400 },
    );
  }
  if (!jobSlug || !jobTitle) {
    return NextResponse.json({ error: "Jobb saknas i ansökan." }, { status: 400 });
  }

  const cv = form.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ error: "CV (PDF) krävs." }, { status: 400 });
  }
  if (cv.size > MAX_CV_BYTES) {
    return NextResponse.json({ error: "CV:t får vara max 15 MB." }, { status: 400 });
  }
  if (cv.type && !ALLOWED_CV_MIME.has(cv.type)) {
    return NextResponse.json(
      { error: "CV:t måste vara en PDF-fil." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toAddress = process.env.JOB_APPLICATIONS_TO?.trim();
  if (!apiKey || !toAddress) {
    console.error(
      "Missing env: RESEND_API_KEY and/or JOB_APPLICATIONS_TO is not configured",
    );
    return NextResponse.json(
      { error: "Ansökan kunde inte skickas. Försök igen senare." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  const { first, last } = splitName(name);
  const fullName = [first, last].filter(Boolean).join(" ") || name;
  const subject = `Ansökan – ${jobTitle} – ${fullName}`;
  const fields = { jobTitle, jobSlug, name, email, phone, motivation };

  const cvFilename = safeCvFilename(name, cv.name || "cv.pdf");
  const cvBuffer = Buffer.from(await cv.arrayBuffer());

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [toAddress],
      replyTo: email,
      subject,
      html: buildHtmlBody(fields),
      text: buildTextBody(fields),
      attachments: [
        {
          filename: cvFilename,
          content: cvBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Kunde inte skicka ansökan. Försök igen." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Resend exception:", err);
    return NextResponse.json(
      { error: "Kunde inte skicka ansökan. Försök igen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
