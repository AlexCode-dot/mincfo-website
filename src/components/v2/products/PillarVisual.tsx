"use client";

import { useEffect, useRef, useState } from "react";
import BrandMark from "../shared/BrandMark";

type Variant = "ledger" | "dashboard" | "copilot" | "chat" | "payroll";

const BG_PHOTO: Partial<Record<Variant, string>> = {
  ledger: "/v2/assets/pillars/ledger.png",
  copilot: "/v2/assets/pillars/copilot.png",
  chat: "/v2/assets/pillars/chat.png",
  payroll: "/v2/assets/pillars/payroll.png",
};

// For Controller & CFO the photo tells the story on its own — no UI overlay.
const NO_OVERLAY: Partial<Record<Variant, true>> = {
  chat: true,
};

export default function PillarVisual({ variant }: { variant: Variant }) {
  const bg = BG_PHOTO[variant];
  const skipOverlay = NO_OVERLAY[variant];

  const inner = skipOverlay
    ? null
    : (() => {
        if (variant === "ledger") return <LedgerVisual />;
        if (variant === "dashboard") return <DashboardVisual />;
        if (variant === "copilot") return <CopilotVisual />;
        if (variant === "chat") return <ChatVisual />;
        if (variant === "payroll") return <PayrollVisual />;
        return null;
      })();

  if (!bg) return inner;

  return (
    <div
      className={`pv-photo pv-photo--${variant}`}
      style={{ backgroundImage: `url(${bg})` }}
    >
      {inner ? <span className="pv-photo-tint" aria-hidden="true" /> : null}
      {inner ? <div className="pv-photo-inner">{inner}</div> : null}
    </div>
  );
}

/* -------------------- Ledger (Redovisning) -------------------- */
function LedgerCard({
  title,
  rows,
  foot,
  className,
}: {
  title: string;
  rows: { label: string; value: string }[];
  foot: string;
  className?: string;
}) {
  return (
    <div className={`pv pv--ledger ${className ?? ""}`.trim()}>
      <div className="pv-head">
        <div className="pv-head-l">
          <span className="pv-logo" aria-hidden="true">
            <BrandMark />
          </span>
          <span className="pv-head-t">{title}</span>
        </div>
        <span className="pv-head-meta pv-head-meta--success">
          <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              d="M2.5 7.5l3 3 6-6.5"
            />
          </svg>
          Klar
        </span>
      </div>
      <ul className="pv-ledger-rows">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="pv-ledger-label">{r.label}</span>
            <span className="pv-ledger-value">{r.value}</span>
          </li>
        ))}
      </ul>
      <div className="pv-foot">
        <span className="pv-foot-meta">{foot}</span>
      </div>
    </div>
  );
}

function LedgerVisual() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`pv-ledger-stack${inView ? " is-in-view" : ""}`}
    >
      <LedgerCard
        className="pv-ledger-card--back"
        title="Kundfakturor · mars"
        rows={[
          { label: "Skickade", value: "38 st" },
          { label: "Betalda", value: "34 / 38" },
          { label: "Påminnelser", value: "Skickade" },
        ]}
        foot="Bokförda i Fortnox"
      />
      <LedgerCard
        className="pv-ledger-card--front"
        title="Leverantörsfakturor · mars"
        rows={[
          { label: "Inkomna", value: "52 st" },
          { label: "Attesterade", value: "48 / 52" },
          { label: "Betalda", value: "44 st" },
        ]}
        foot="Bokförda i Fortnox"
      />
    </div>
  );
}

/* -------------------- Dashboard (Rapportering) — real product screenshots -------------------- */
function DashboardVisual() {
  return (
    <div className="pv-dashboard-stack">
      <div className="pv-dashboard-shot">
        <img
          src="/v2/assets/pillars/dashboard.webp"
          alt="MinCFO-plattformens Investor Board med Revenue Quarterly vs LY och KPI:er"
        />
      </div>
      <div className="pv-dashboard-pl">
        <img
          src="/v2/assets/pillars/pl-table.webp"
          alt="P&L-rapport i MinCFO med avvikelse-kolumner"
        />
      </div>
    </div>
  );
}

/* -------------------- Copilot (AI Copilot) — matches real /cfo UI -------------------- */
type CopilotPhase = "pre" | "asking" | "thinking" | "done";

function CopilotVisual() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<CopilotPhase>("pre");

  // Trigger animation when the card scrolls into view (once).
  useEffect(() => {
    const node = ref.current;
    if (!node || phase !== "pre") return;
    if (typeof IntersectionObserver === "undefined") {
      setPhase("done");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setPhase("asking");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [phase]);

  // Phase progression: asking → thinking → done.
  useEffect(() => {
    if (phase === "asking") {
      const t = setTimeout(() => setPhase("thinking"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("done"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div
      ref={ref}
      className={`pv pv--copilot pv--copilot-phase-${phase}`}
    >
      <div className="pv-cfo-head">
        <span className="pv-logo" aria-hidden="true">
          <BrandMark />
        </span>
        <span className="pv-cfo-title">AI CFO-assistent</span>
      </div>
      <div className="pv-cfo-msg pv-cfo-msg--user">
        <span className="pv-cfo-bubble">Hur ser vår runway ut?</span>
        <span className="pv-cfo-avatar" aria-hidden="true">A</span>
      </div>
      <div className="pv-cfo-thinking">
        <span className="pv-cfo-spinner" aria-hidden="true" />
        {phase === "thinking" ? "Tänker…" : "Tänkte i 9 sekunder"}
      </div>
      <p className="pv-cfo-answer">
        Baserat på Q1 2026 har ni cirka <strong>11,4 månader runway</strong>
        {" "}(kassa 1 696 581 kr, snittburn −148 700 kr/mån).
      </p>
      <div className="pv-cfo-chart" aria-hidden="true">
        <div className="pv-cfo-chart-l">Kassa över tid · forecast</div>
        <svg
          className="pv-cfo-chart-svg"
          viewBox="0 0 240 72"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pvCfoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C3DFF" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#4C3DFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="18" x2="240" y2="18" stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="0" y1="44" x2="240" y2="44" stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="2 4" />
          <path
            d="M0,18 C36,20 64,26 96,32 C132,40 168,52 240,66 L240,72 L0,72 Z"
            fill="url(#pvCfoGradient)"
          />
          <path
            d="M0,18 C36,20 64,26 96,32 C132,40 168,52 240,66"
            fill="none"
            stroke="#4C3DFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="0" cy="18" r="2.5" fill="#4C3DFF" />
          <circle cx="240" cy="66" r="2.5" fill="#4C3DFF" />
        </svg>
        <div className="pv-cfo-chart-axis">
          <span>Idag</span>
          <span>Q3</span>
          <span>Q4</span>
          <span>11,4 mån</span>
        </div>
      </div>
      <div className="pv-cfo-input">
        <span className="pv-cfo-input-placeholder">Vad vill du veta?</span>
        <div className="pv-cfo-input-foot">
          <span className="pv-cfo-input-funk">
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
              <path stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"
                d="M3 3h6M3 6h6M3 9h4" />
            </svg>
            Funktioner
          </span>
          <span className="pv-cfo-input-right">
            <span className="pv-cfo-input-counter">○ 499</span>
            <span className="pv-cfo-input-send" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 12 12">
                <path stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"
                  strokeLinejoin="round" d="M6 9V3m0 0L3 5.5M6 3l3 2.5" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Chat (Controller & CFO) -------------------- */
function ChatVisual() {
  return (
    <div className="pv pv--chat">
      <div className="pv-head">
        <div className="pv-head-l">
          <span className="pv-avatar" aria-hidden="true">
            <span>AS</span>
          </span>
          <span className="pv-head-stack">
            <span className="pv-head-t">Anna Sköld</span>
            <span className="pv-head-sub">Controller · MinCFO</span>
          </span>
        </div>
        <span className="pv-head-meta">10:14</span>
      </div>
      <div className="pv-chat-msgs">
        <div className="pv-chat-msg pv-chat-msg--in">
          Hej! Personalkostnaden ligger 1,7% över budget i mars. Vill ni att
          jag tar fram en analys till fredagens genomgång?
        </div>
        <div className="pv-chat-msg pv-chat-msg--in">
          Jag har också uppdaterat prognosen baserat på kundinbetalningarna i
          går.
        </div>
        <div className="pv-chat-attach">
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
              d="M3 7h8M3 4h5M3 10h6"
              strokeLinecap="round"
            />
          </svg>
          Q1-prognos · uppdaterad
        </div>
      </div>
      <div className="pv-foot pv-foot--chat">
        <span className="pv-foot-meta">
          <span className="pv-pulse" /> Aktiv · svarar oftast inom timmen
        </span>
      </div>
    </div>
  );
}

/* -------------------- Payroll (Lön) -------------------- */
function PayrollVisual() {
  const rows: { name: string; role: string; amount: string }[] = [
    { name: "Anna Karlsson", role: "Engineering", amount: "42 800 kr" },
    { name: "Conrad Lindqvist", role: "Sales", amount: "38 500 kr" },
    { name: "Maja Holm", role: "Operations", amount: "36 200 kr" },
    { name: "Erik Sandström", role: "Engineering", amount: "44 100 kr" },
  ];
  return (
    <div className="pv pv--payroll">
      <div className="pv-head">
        <div className="pv-head-l">
          <span className="pv-logo" aria-hidden="true">
            <BrandMark />
          </span>
          <span className="pv-head-t">Lönekörning · mars 2026</span>
        </div>
        <span className="pv-head-meta pv-head-meta--success">
          <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              d="M2.5 7.5l3 3 6-6.5"
            />
          </svg>
          Klar
        </span>
      </div>
      <ul className="pv-payroll-rows">
        {rows.map((r) => (
          <li key={r.name}>
            <span className="pv-payroll-role">{r.role}</span>
            <span className="pv-payroll-name pv-blur">{r.name}</span>
            <span className="pv-payroll-amount pv-blur">{r.amount}</span>
          </li>
        ))}
      </ul>
      <div className="pv-payroll-total">
        <span>Total · 12 anställda</span>
        <span className="pv-blur">482 350 kr</span>
      </div>
      <div className="pv-foot">
        <span className="pv-foot-meta">Klar att skickas till bank</span>
      </div>
    </div>
  );
}
