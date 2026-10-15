"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { count, open } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-black tracking-widest">
          AIBIMY
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#parlantes" className="hidden hover:text-amber-300 sm:inline">
            Parlantes
          </Link>
          <Link href="/#comparar" className="hidden hover:text-amber-300 sm:inline">
            Comparar
          </Link>
          <button onClick={open} className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-950">
            Carrito ({count})
          </button>
        </nav>
      </div>
    </header>
  );
}
