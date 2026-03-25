import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

const logoPath =
  "M0 0h13.474v15.36C6.032 15.36 0 9.328 0 1.886V0Zm0 16.64h13.474V32C6.032 32 0 25.968 0 18.526V16.64Zm16.596 0H32v1.218a8.702 8.702 0 0 1-17.404 0V16.64Zm0-16.64H32v1.218a8.702 8.702 0 0 1-17.404 0V0Z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 36,
            background: "linear-gradient(180deg, #111833 0%, #0a1022 100%)",
          }}
        >
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
            <path d={logoPath} fill="#4C3DFF" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
