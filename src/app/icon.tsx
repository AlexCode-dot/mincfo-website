import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

const logoPath =
  "M0 0h13.474v15.36C6.032 15.36 0 9.328 0 1.886V0Zm0 16.64h13.474V32C6.032 32 0 25.968 0 18.526V16.64Zm16.596 0H32v1.218a8.702 8.702 0 0 1-17.404 0V16.64Zm0-16.64H32v1.218a8.702 8.702 0 0 1-17.404 0V0Z";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #0f1630 0%, #0a0f22 100%)",
        }}
      >
        <div
          style={{
            width: 384,
            height: 384,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 104,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <svg width="210" height="210" viewBox="0 0 32 32" fill="none">
            <path d={logoPath} fill="#4C3DFF" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
