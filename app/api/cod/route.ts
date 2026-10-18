import { NextResponse } from "next/server";
import { createCodOrder, parseCodRequest } from "@/lib/cod";
import { allow, clientIp, sameOrigin } from "@/lib/request-guard";
import { checkoutEnabled, codEnabled } from "@/lib/store";

const HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!checkoutEnabled || !codEnabled) {
    return NextResponse.json({ error: "El pago contra entrega todavía no está habilitado." }, { status: 503 });
  }
  if (!sameOrigin(request)) return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  // Cash-on-delivery orders cost a shipment each, so fake ones are expensive: a few per hour per IP.
  if (!allow(`cod:${clientIp(request)}`, 4, HOUR)) {
    return NextResponse.json({ error: "Recibimos varios pedidos seguidos. Escríbenos por WhatsApp para terminar el tuyo." }, { status: 429 });
  }

  const parsed = parseCodRequest(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const result = await createCodOrder(parsed.value);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ orderName: result.orderName });
}
