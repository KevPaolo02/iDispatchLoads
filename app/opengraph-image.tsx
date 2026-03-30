import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "iDispatchLoads.com dispatch services for NY, NJ, CT, and PA owner-operators";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #10233d 48%, #0f766e 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#7dd3fc",
          }}
        >
          iDispatchLoads.com
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            Northeast Dispatch Services for Owner-Operators
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.4, color: "#dbeafe" }}>
            Built for drivers running from, through, or to NY, NJ, CT, and PA.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["Save time", "Get better rates", "Stay loaded"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "14px 22px",
                fontSize: 24,
                background: "rgba(255,255,255,0.08)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
