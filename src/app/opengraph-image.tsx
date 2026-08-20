import { ImageResponse } from "next/og";

export const alt = "Vinh Tran — Backend & Infrastructure Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fafaf7",
        color: "#0a0a0a",
        border: "16px solid #0a0a0a",
        padding: "56px 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 4,
          fontWeight: 700,
        }}
      >
        BACKEND / INFRASTRUCTURE · PURDUE CS
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 168,
            fontWeight: 900,
            lineHeight: 0.86,
            letterSpacing: -6,
          }}
        >
          VINH
        </div>
        <div
          style={{
            fontSize: 168,
            fontWeight: 900,
            lineHeight: 0.86,
            letterSpacing: -6,
          }}
        >
          TRAN
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            background: "#ff3b00",
            color: "#0a0a0a",
            padding: "12px 22px",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          375K OPS/SEC
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 2,
            color: "#5e5e58",
          }}
        >
          1,000+ CONCURRENT SSE · 10,219 RECORDS VERIFIED
        </div>
      </div>
    </div>,
    size,
  );
}
