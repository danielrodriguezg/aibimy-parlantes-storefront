import type { Metadata } from "next";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Parlantes AIBIMY", template: "%s | Parlantes AIBIMY" },
  description: "Parlantes Bluetooth AIBIMY con envío a toda Colombia y pago seguro."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          <SiteHeader />
          {children}
          <CartDrawer />
          <footer className="mt-24 border-t border-neutral-200 py-10 text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} Parlantes AIBIMY · Envíos a toda Colombia
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
