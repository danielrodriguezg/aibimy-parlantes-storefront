import type { Metadata, Viewport } from "next";
import { Comfortaa, Onest } from "next/font/google";
import Link from "next/link";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { SmoothScroll } from "@/components/scroll/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const text = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" });
// Rounded face for the Parla wordmark; used for the logo only.
const logo = Comfortaa({ subsets: ["latin"], weight: "700", variable: "--font-logo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Parla · parlantes AIBIMY", template: "%s | Parla" },
  description: "Parla vende parlantes Bluetooth AIBIMY con luces RGB y emparejamiento TWS. Envío a toda Colombia y pago seguro."
};

export const viewport: Viewport = { themeColor: "#f5f6f3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${text.variable} ${logo.variable}`}>
      <body className="relative antialiased">
        <div className="daylight pointer-events-none absolute inset-x-0 top-0 h-[64rem]" aria-hidden />
        <CartProvider>
          <SmoothScroll />
          <SiteHeader />
          {children}
          <CartDrawer />
          <footer className="border-t border-tinta/10 px-5 py-12 text-sm text-gris sm:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="wordmark text-2xl text-tinta">
                parla<span className="text-caucho">.</span>
              </p>
              <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/#linea" className="hover:text-tinta">
                  Modelos
                </Link>
                <Link href="/#comparar" className="hover:text-tinta">
                  Comparar
                </Link>
                <Link href="/#envios" className="hover:text-tinta">
                  Envíos
                </Link>
              </nav>
              <p>© {new Date().getFullYear()} Parla. Vendemos parlantes AIBIMY con envío a toda Colombia.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
