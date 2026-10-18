"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { BagIcon } from "@/components/icons";

export function SiteHeader() {
  const { count, open } = useCart();
  // Transparent over the hero; a frosted bar once the page scrolls under it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "bg-papel/80 shadow-[0_1px_0_rgb(17_18_20/0.06)] backdrop-blur-xl" : ""
      }`}
    >
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-10">
        <nav aria-label="Principal" className="flex items-center gap-8 text-[0.9375rem] font-medium">
          <Link href="/#linea" className="hidden transition-colors hover:text-caucho sm:inline">
            Modelos
          </Link>
          <Link href="/#comparar" className="hidden transition-colors hover:text-caucho sm:inline">
            Comparar
          </Link>
          <Link href="/#envios" className="hidden transition-colors hover:text-caucho md:inline">
            Envíos
          </Link>
        </nav>
        <Link href="/" className="wordmark text-[1.75rem] sm:text-3xl" aria-label="Parla, inicio">
          parla<span className="text-caucho">.</span>
        </Link>
        <div className="flex justify-end">
          <button
            onClick={open}
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white"
            aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
          >
            <BagIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-caucho px-1 text-[0.7rem] font-bold text-white tabular-nums">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
