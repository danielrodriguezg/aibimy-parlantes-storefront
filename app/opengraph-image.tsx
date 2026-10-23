import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The card shown when the site is shared on WhatsApp, Facebook or Instagram.
export const alt = "Luzunido · parlantes Bluetooth AIBIMY originales con luces RGB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const photo = await readFile(join(process.cwd(), "assets/og-my274bt.png"));
  const src = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f6f7f5",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#1c1d21"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ fontSize: 44, color: "#ff6b00", fontWeight: 700 }}>luzunido</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>el sonido también se ve.</div>
            <div style={{ fontSize: 32, color: "#5d6068" }}>Parlantes Bluetooth AIBIMY originales con luces RGB, hasta 40 W, IPX6 y TWS.</div>
          </div>
          <div style={{ fontSize: 28, color: "#5d6068" }}>Envío a toda Colombia</div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 360, alignItems: "flex-end", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              top: 90,
              bottom: 0,
              background: "#aebbbb",
              borderRadius: "180px 180px 0 0"
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={248} height={520} alt="" style={{ position: "relative" }} />
        </div>
      </div>
    ),
    size
  );
}
