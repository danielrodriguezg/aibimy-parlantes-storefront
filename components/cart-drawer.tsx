"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const currencyCode = items[0]?.price.currencyCode ?? "COP";
  const subtotal = items.reduce((sum, line) => sum + Number(line.price.amount) * line.quantity, 0);

  async function checkout() {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: items.map(({ variantId, quantity }) => ({ variantId, quantity })) })
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || "No pudimos iniciar el pago.");
      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      setStatus("error");
      setError(checkoutError instanceof Error ? checkoutError.message : "No pudimos iniciar el pago.");
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-label="Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button onClick={close} className="rounded-full px-3 py-1 text-sm hover:bg-neutral-100" aria-label="Cerrar carrito">
            Cerrar
          </button>
        </header>

        {items.length === 0 ? (
          <p className="flex-1 px-5 py-10 text-center text-neutral-500">Tu carrito está vacío.</p>
        ) : (
          <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto px-5">
            {items.map((line) => (
              <li key={line.variantId} className="flex gap-4 py-4">
                {line.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.imageUrl} alt="" className="h-20 w-20 rounded-lg bg-neutral-100 object-contain" />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium leading-tight">{line.title}</p>
                  {line.variantTitle && <p className="text-xs text-neutral-500">{line.variantTitle}</p>}
                  <p className="text-sm">{formatMoney(line.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded-full border border-neutral-300"
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      className="h-7 w-7 rounded-full border border-neutral-300"
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                    <button className="ml-auto text-xs text-neutral-500 underline" onClick={() => remove(line.variantId)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="border-t border-neutral-200 px-5 py-4">
          <div className="mb-3 flex justify-between text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatMoney({ amount: String(subtotal), currencyCode })}</span>
          </div>
          <p className="mb-3 text-xs text-neutral-500">El envío se calcula en el pago. Pagas de forma segura en Shopify.</p>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <button
            onClick={checkout}
            disabled={items.length === 0 || status === "loading"}
            className="w-full rounded-full bg-neutral-950 py-3 font-semibold text-white disabled:opacity-40"
          >
            {status === "loading" ? "Redirigiendo..." : "Ir a pagar"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
