import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

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
          background:
            "linear-gradient(145deg, #1a1e44 0%, #3f39ff 60%, #6d34ff 100%)",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 50 50" fill="none">
          <path d="M0 0H24V24A24 24 0 0 1 0 0Z" fill="white" />
          <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" fill="white" />
          <path d="M0 26H24V50A24 24 0 0 1 0 26Z" fill="white" />
          <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" fill="white" />
        </svg>
      </div>
    ),
    size,
  );
}
