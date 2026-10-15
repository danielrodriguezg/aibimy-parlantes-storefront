"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { count, open } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-escenario/55 text-blanco backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-10">
        <Link href="/" className="display text-xl text-caucho" aria-label="AIBIMY, inicio">
          aibimy
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-7 text-[0.9375rem]">
          <Link href="/#linea" className="hidden text-blanco/75 transition-colors hover:text-blanco sm:inline">
            Modelos
          </Link>
          <Link href="/#comparar" className="hidden text-blanco/75 transition-colors hover:text-blanco sm:inline">
            Comparar
          </Link>
          <button
            onClick={open}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 transition-colors hover:border-white/50"
          >
            Carrito
            <span
              className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                count ? "bg-caucho text-escenario" : "bg-white/10"
              }`}
            >
              {count}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
