"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { Bag } from "@/components/ui/icons";

export function SiteHeader() {
  const { count, open } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-papel/80 backdrop-blur-xl">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-10">
        <nav aria-label="Principal" className="flex items-center gap-8 text-[0.9375rem] font-medium">
          <Link href="/#linea" className="transition-colors hover:text-caucho">
            Modelos
          </Link>
          <Link href="/#comparar" className="hidden transition-colors hover:text-caucho sm:inline">
            Comparar
          </Link>
        </nav>
        <Link href="/" className="wordmark text-[1.75rem] text-caucho" aria-label="Luzonido, inicio">
          luzonido
        </Link>
        <button
          onClick={open}
          className="relative grid h-11 w-11 place-items-center justify-self-end rounded-full transition-colors hover:bg-white"
          aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
        >
          <Bag className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute top-0.5 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-caucho px-1 text-[0.6875rem] font-semibold text-white tabular-nums">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
