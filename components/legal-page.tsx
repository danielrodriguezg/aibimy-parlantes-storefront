import Link from "next/link";
import type { ReactNode } from "react";
import { getSeller, isSellerComplete, type Seller } from "@/lib/seller";

export const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Privacidad y datos" },
  { href: "/envios", label: "Envíos" },
  { href: "/devoluciones", label: "Garantía y devoluciones" }
];

/** A seller field, or a highlighted placeholder while it hasn't been configured. */
export function Field({ value, label }: { value: string | null; label: string }) {
  return value ? <>{value}</> : <mark className="rounded bg-caucho/15 px-1 text-tinta">[{label} pendiente]</mark>;
}

/** The seller's identification block, shared by every legal page. */
export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <dl className="chip grid gap-2 rounded-[1.5rem] p-6 text-[0.9375rem] sm:grid-cols-[10rem_1fr]">
      <dt className="text-gris">Tienda</dt>
      <dd>{seller.store}</dd>
      <dt className="text-gris">Vendedor</dt>
      <dd>
        <Field value={seller.legalName} label="Nombre o razón social" />
      </dd>
      <dt className="text-gris">NIT o cédula</dt>
      <dd>
        <Field value={seller.taxId} label="NIT o cédula" />
      </dd>
      <dt className="text-gris">Dirección</dt>
      <dd>
        <Field value={seller.address} label="Dirección" />, <Field value={seller.city} label="Ciudad" />
      </dd>
      <dt className="text-gris">Correo</dt>
      <dd>
        <Field value={seller.email} label="Correo" />
      </dd>
      <dt className="text-gris">WhatsApp</dt>
      <dd>
        <Field value={seller.whatsapp} label="WhatsApp" />
      </dd>
    </dl>
  );
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: (seller: Seller) => ReactNode }) {
  const seller = getSeller();
  return (
    <main className="px-5 pt-32 pb-24 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Páginas legales" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] lg:flex-col">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gris hover:text-tinta">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="max-w-[68ch]">
          {!isSellerComplete(seller) && (
            <p className="mb-8 rounded-2xl border border-caucho/40 bg-caucho/10 p-4 text-[0.9375rem]">
              Borrador: faltan datos del vendedor. Esta página no es válida para vender hasta completarlos.
            </p>
          )}
          <h1 className="display display-l">{title}</h1>
          <p className="mt-3 text-sm text-gris">Última actualización: {updated}</p>
          <div className="legal-body mt-10">{children(seller)}</div>
        </article>
      </div>
    </main>
  );
}
