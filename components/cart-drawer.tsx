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
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-tinta/30 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-label="Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-papel text-tinta shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-tinta/10 px-5 py-4">
          <h2 className="display text-xl">Tu carrito</h2>
          <button onClick={close} className="rounded-full px-3 py-1 text-sm text-gris hover:bg-white hover:text-tinta" aria-label="Cerrar carrito">
            Cerrar
          </button>
        </header>

        {items.length === 0 ? (
          <p className="flex-1 px-5 py-10 text-center text-gris">Tu carrito está vacío. Elige un parlante para empezar.</p>
        ) : (
          <ul className="flex-1 divide-y divide-tinta/10 overflow-y-auto overscroll-contain px-5">
            {items.map((line) => (
              <li key={line.variantId} className="flex gap-4 py-4">
                {line.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.imageUrl} alt="" className="h-20 w-20 rounded-2xl bg-white object-contain p-1" />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium leading-tight">{line.title}</p>
                  {line.variantTitle && <p className="text-xs text-gris">{line.variantTitle}</p>}
                  <p className="text-sm tabular-nums">{formatMoney(line.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded-full border border-tinta/20 bg-white hover:border-tinta/50"
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                    <button
                      className="h-7 w-7 rounded-full border border-tinta/20 bg-white hover:border-tinta/50"
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                    <button className="ml-auto text-xs text-gris underline hover:text-tinta" onClick={() => remove(line.variantId)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="border-t border-tinta/10 px-5 py-4">
          <div className="mb-3 flex justify-between text-base font-semibold">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney({ amount: String(subtotal), currencyCode })}</span>
          </div>
          <p className="mb-3 text-xs text-gris">El envío se calcula en el pago. Pagas de forma segura en Shopify.</p>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <button
            onClick={checkout}
            disabled={items.length === 0 || status === "loading"}
            className="w-full rounded-full bg-tinta py-4 font-semibold text-white transition-colors hover:bg-black disabled:opacity-40"
          >
            {status === "loading" ? "Redirigiendo..." : "Ir a pagar"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
