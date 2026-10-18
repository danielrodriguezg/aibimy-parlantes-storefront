import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/shopify";
import { allow, clientIp, sameOrigin } from "@/lib/request-guard";
import { checkoutEnabled } from "@/lib/store";
import type { CartLine } from "@/lib/types";

const MAX_LINES = 20;

function parseLines(body: unknown): CartLine[] {
  const lines = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(lines)) return [];
  return lines
    .slice(0, MAX_LINES)
    .filter((line): line is CartLine => typeof line?.variantId === "string" && Number.isFinite(line?.quantity))
    .map(({ variantId, quantity }) => ({ variantId, quantity }));
}

export async function POST(request: Request) {
  if (!checkoutEnabled) return NextResponse.json({ error: "Los pagos todavía no están habilitados." }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  if (!allow(`checkout:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  }
  const lines = parseLines(await request.json().catch(() => null));
  if (!lines.length) return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });

  try {
    const checkoutUrl = await createCheckout(lines);
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta de nuevo." }, { status: 502 });
  }
}
