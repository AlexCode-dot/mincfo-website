import type { Metadata } from "next";
import { ImageResponse } from "next/og";

export type OgTheme = "home" | "ceo" | "finance" | "saas" | "consulting" | "retail";

type OgConfig = {
  title: string;
  description: string;
  eyebrow?: string;
  path: string;
  theme?: OgTheme;
};

const logoPath =
  "M0 0h13.474v15.36C6.032 15.36 0 9.328 0 1.886V0Zm0 16.64h13.474V32C6.032 32 0 25.968 0 18.526V16.64Zm16.596 0H32v1.218a8.702 8.702 0 0 1-17.404 0V16.64Zm0-16.64H32v1.218a8.702 8.702 0 0 1-17.404 0V0Z";

const THEME_STYLES: Record<OgTheme, { background: string; glow: string; panel: string }> = {
  home: {
    background:
      "radial-gradient(circle at top left, rgba(37, 99, 235, 0.34), transparent 34%), linear-gradient(135deg, #13162a 0%, #1a1e44 28%, #3f39ff 64%, #6d34ff 100%)",
    glow: "radial-gradient(circle, rgba(120, 100, 255, 0.34), transparent 68%)",
    panel: "rgba(11, 15, 34, 0.22)",
  },
  ceo: {
    background:
      "radial-gradient(circle at 18% 18%, rgba(36, 86, 255, 0.32), transparent 28%), linear-gradient(145deg, #090b16 0%, #101332 42%, #263dff 100%)",
    glow: "radial-gradient(circle, rgba(83, 104, 255, 0.32), transparent 70%)",
    panel: "rgba(10, 12, 32, 0.2)",
  },
  finance: {
    background:
      "radial-gradient(circle at 72% 12%, rgba(71, 85, 255, 0.28), transparent 28%), linear-gradient(135deg, #090b15 0%, #11162f 38%, #243dff 72%, #553bff 100%)",
    glow: "radial-gradient(circle, rgba(97, 107, 255, 0.28), transparent 68%)",
    panel: "rgba(9, 12, 30, 0.22)",
  },
  saas: {
    background:
      "radial-gradient(circle at 15% 22%, rgba(0, 184, 255, 0.22), transparent 26%), linear-gradient(140deg, #060a14 0%, #101735 36%, #1f48ff 72%, #3d75ff 100%)",
    glow: "radial-gradient(circle, rgba(64, 134, 255, 0.28), transparent 66%)",
    panel: "rgba(8, 14, 32, 0.22)",
  },
  consulting: {
    background:
      "radial-gradient(circle at 24% 18%, rgba(93, 67, 255, 0.28), transparent 26%), linear-gradient(140deg, #080912 0%, #11152d 32%, #342fff 68%, #6b3aff 100%)",
    glow: "radial-gradient(circle, rgba(120, 87, 255, 0.28), transparent 66%)",
    panel: "rgba(11, 13, 30, 0.22)",
  },
  retail: {
    background:
      "radial-gradient(circle at 78% 18%, rgba(96, 76, 255, 0.26), transparent 26%), linear-gradient(140deg, #090a14 0%, #111632 38%, #3140ff 72%, #7a38ff 100%)",
    glow: "radial-gradient(circle, rgba(123, 92, 255, 0.28), transparent 68%)",
    panel: "rgba(11, 14, 32, 0.22)",
  },
};

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";
export const OG_IMAGE_RUNTIME = "edge";

export function buildPageMetadata({ title, description, path }: OgConfig): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
      images: [
        {
          url: `${path}/opengraph-image`,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${path}/opengraph-image`],
    },
  };
}

export function createOgImage({
  title,
  description,
  eyebrow = "MinCFO",
  theme = "home",
}: Omit<OgConfig, "path">) {
  const style = THEME_STYLES[theme];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: style.background,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -40,
            top: -64,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: style.glow,
            filter: "blur(12px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -140,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: style.glow,
            filter: "blur(18px)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "72px 80px",
            justifyContent: "space-between",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 760,
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <svg width="42" height="42" viewBox="0 0 32 32" fill="none">
                <path d={logoPath} fill="white" />
              </svg>
              <div
                style={{
                  display: "flex",
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                }}
              >
                MinCFO
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                  padding: "12px 20px",
                  borderRadius: 9999,
                  background: "rgba(14, 18, 40, 0.38)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: 22,
                  color: "rgba(255,255,255,0.78)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {eyebrow}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 70,
                  lineHeight: 1.02,
                  fontWeight: 750,
                  letterSpacing: "-0.06em",
                  maxWidth: 760,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 29,
                  lineHeight: 1.35,
                  color: "rgba(255,255,255,0.84)",
                  maxWidth: 700,
                }}
              >
                {description}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 260,
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 232,
                height: 232,
                borderRadius: 38,
                alignItems: "center",
                justifyContent: "center",
                background: style.panel,
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 20px 80px rgba(10, 8, 28, 0.28)",
              }}
            >
              <svg width="124" height="124" viewBox="0 0 32 32" fill="none">
                <path d={logoPath} fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
