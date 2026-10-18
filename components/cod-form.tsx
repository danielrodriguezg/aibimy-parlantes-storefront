"use client";

import { useRef, useState } from "react";
import { DEPARTMENTS } from "@/lib/colombia";
import { formatMoney } from "@/lib/money";
import { codEnabled } from "@/lib/store";
import type { Money } from "@/lib/types";

export type CodItem = { variantId: string; quantity: number; title: string; price: Money };

const FEE = Number(process.env.NEXT_PUBLIC_COD_SHIPPING_FEE || 0);

const field =
  "w-full rounded-2xl border border-tela/15 bg-white px-4 py-3 text-base text-tela outline-none transition-colors placeholder:text-niebla focus:border-tela";

/**
 * "Pídelo y paga al recibir": the cash-on-delivery order form. A short form (name, mobile,
 * address) instead of a card checkout, which is how most people in Colombia buy online.
 */
export function CodButton({
  items,
  className = "",
  onDone
}: {
  items: CodItem[];
  className?: string;
  onDone?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [orderName, setOrderName] = useState("");

  if (!codEnabled || !items.length) return null;

  const currencyCode = items[0].price.currencyCode;
  const subtotal = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  const total = { amount: String(subtotal + FEE), currencyCode };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lines: items.map(({ variantId, quantity }) => ({ variantId, quantity })) })
      });
      const payload = (await response.json()) as { orderName?: string; error?: string };
      if (!response.ok || !payload.orderName) throw new Error(payload.error || "No pudimos registrar el pedido.");
      setOrderName(payload.orderName);
      setStatus("done");
    } catch (submitError) {
      setStatus("idle");
      setError(submitError instanceof Error ? submitError.message : "No pudimos registrar el pedido.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`flex items-center justify-center gap-3 rounded-full border-2 border-tela bg-white px-6 py-[0.875rem] font-medium text-tela transition-colors hover:bg-tela hover:text-white ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2.5" y="6" width="19" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 9.5v5M18 9.5v5" />
        </svg>
        Pídelo y paga al recibir
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="cod-title"
        className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-[32px] bg-papel p-0 text-tela backdrop:bg-tela/40 backdrop:backdrop-blur-sm"
        onClose={() => {
          // Empty the cart only once the customer has seen the confirmation.
          if (status !== "done") return;
          setStatus("idle");
          onDone?.();
        }}
      >
        <div className="max-h-[85svh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="cod-title" className="display display-s">
                paga al recibir.
              </h2>
              <p className="mt-1 text-sm text-grafito">Pago contra entrega: pagas en efectivo cuando el parlante llega a tu casa.</p>
            </div>
            <button type="button" onClick={() => dialog.current?.close()} className="rounded-full px-3 py-1 text-sm text-grafito hover:bg-white">
              Cerrar
            </button>
          </div>

          {status === "done" ? (
            <div className="grid gap-4" role="status">
              <p className="display display-s text-caucho">¡pedido {orderName} recibido!</p>
              <p className="text-grafito">
                Pagas {formatMoney(total)} en efectivo al recibir{FEE ? "" : ", más el envío que te confirmamos"}. Te escribimos por WhatsApp para
                confirmar tu dirección antes de despacharlo.
              </p>
              <button type="button" onClick={() => dialog.current?.close()} className="justify-self-start rounded-full bg-tela px-7 py-3.5 font-medium text-white">
                Listo
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-3">
              <ul className="mb-2 grid gap-1 rounded-2xl bg-white p-4 text-sm">
                {items.map((item) => (
                  <li key={item.variantId} className="flex justify-between gap-4">
                    <span>
                      {item.quantity} × {item.title}
                    </span>
                    <span className="tabular-nums">{formatMoney({ amount: String(Number(item.price.amount) * item.quantity), currencyCode })}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 text-grafito">
                  <span>Envío</span>
                  <span className="tabular-nums">{FEE ? formatMoney({ amount: String(FEE), currencyCode }) : "Te lo confirmamos"}</span>
                </li>
                <li className="mt-1 flex justify-between gap-4 border-t border-tela/10 pt-2 font-semibold">
                  <span>Pagas al recibir</span>
                  <span className="tabular-nums">{formatMoney(total)}</span>
                </li>
              </ul>

              <label className="grid gap-1 text-sm font-medium">
                Nombre y apellido
                <input name="name" required autoComplete="name" className={field} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Celular (WhatsApp)
                <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="300 123 4567" className={field} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Departamento
                  <select name="province" required defaultValue="" className={field}>
                    <option value="" disabled>
                      Elige
                    </option>
                    {DEPARTMENTS.map((department) => (
                      <option key={department.code} value={department.code}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Ciudad o municipio
                  <input name="city" required autoComplete="address-level2" className={field} />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-medium">
                Dirección
                <input name="address" required autoComplete="street-address" placeholder="Calle 10 # 20-30, apto 101" className={field} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Barrio
                <input name="neighborhood" className={field} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Indicaciones para la entrega (opcional)
                <textarea name="notes" rows={2} className={field} />
              </label>
              {/* Honeypot for bots; hidden from people and from screen readers. */}
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <p className="text-xs text-grafito">
                Al pedir aceptas los{" "}
                <a href="/legal/terminos" className="underline">
                  términos
                </a>{" "}
                y el{" "}
                <a href="/legal/privacidad" className="underline">
                  tratamiento de tus datos
                </a>{" "}
                para entregar tu pedido.
              </p>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-1 rounded-full bg-tela py-4 font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {status === "sending" ? "Enviando..." : "Confirmar pedido · pago al recibir"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
