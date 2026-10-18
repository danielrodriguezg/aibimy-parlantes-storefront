import type { Metadata, Viewport } from "next";
import { Comfortaa, Onest, Unbounded } from "next/font/google";
import Link from "next/link";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { SmoothScroll } from "@/components/scroll/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { checkoutEnabled } from "@/lib/store";
import "./globals.css";

const display = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap" });
const text = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" });
// Rounded logo face for the Luzunido wordmark; used for the logo only.
const logo = Comfortaa({ subsets: ["latin"], weight: "700", variable: "--font-logo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Luzunido · parlantes AIBIMY originales", template: "%s | Luzunido" },
  description: "Luzunido vende parlantes Bluetooth AIBIMY originales con luces RGB y emparejamiento TWS. Envío a toda Colombia.",
  // A test deploy (checkout off) stays out of search results.
  robots: checkoutEnabled ? undefined : { index: false, follow: false }
};

export const viewport: Viewport = { themeColor: "#f6f7f5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${text.variable} ${logo.variable}`}>
      <body className="antialiased">
        {/* Studio light: a warm wash in one corner of the window and a cool one in the other. */}
        <div className="wash pointer-events-none fixed inset-0 -z-10" aria-hidden />
        <CartProvider>
          {!checkoutEnabled && (
            <p className="bg-tela px-5 py-2 text-center text-sm text-white">Tienda en pruebas: todavía no recibimos pedidos.</p>
          )}
          <SmoothScroll />
          <SiteHeader />
          {children}
          <CartDrawer />
          <footer className="border-t border-tela/10 px-5 py-12 text-sm text-grafito sm:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="wordmark text-2xl text-caucho">luzunido</p>
                <p className="mt-2">Parlantes AIBIMY originales.</p>
              </div>
              <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/#linea" className="hover:text-tela">
                  Modelos
                </Link>
                <Link href="/#comparar" className="hover:text-tela">
                  Comparar
                </Link>
                <Link href="/legal/envios" className="hover:text-tela">
                  Envíos
                </Link>
                <Link href="/legal/devoluciones" className="hover:text-tela">
                  Devoluciones y garantía
                </Link>
                <Link href="/legal/terminos" className="hover:text-tela">
                  Términos
                </Link>
                <Link href="/legal/privacidad" className="hover:text-tela">
                  Privacidad
                </Link>
              </nav>
              <p>© {new Date().getFullYear()} Luzunido. Envíos a toda Colombia.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
