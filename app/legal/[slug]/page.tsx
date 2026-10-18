import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL } from "@/components/legal/content";
import { SELLER } from "@/lib/seller";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(LEGAL).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const doc = LEGAL[(await params).slug];
  return doc ? { title: doc.title.replace(/\.$/, ""), description: doc.summary } : {};
}

export default async function LegalPage({ params }: Params) {
  const doc = LEGAL[(await params).slug];
  if (!doc) notFound();

  return (
    <main className="px-5 pt-10 pb-24 sm:px-10">
      <article className="mx-auto max-w-3xl rounded-[32px] bg-white p-6 sm:p-12">
        {SELLER.draft && (
          <p className="mb-8 rounded-2xl bg-caucho-suave px-5 py-4 text-sm text-tela">
            Borrador: faltan los datos del vendedor y la revisión de un abogado antes de publicar.
          </p>
        )}
        <h1 className="display display-m">{doc.title}</h1>
        <p className="lede mt-4 text-grafito">{doc.summary}</p>
        <div className="legal mt-10 text-grafito">{doc.body}</div>
        <p className="mt-12 text-sm text-niebla">Última actualización: {SELLER.updated}.</p>
      </article>
      <nav aria-label="Páginas legales" className="mx-auto mt-8 flex max-w-3xl flex-wrap gap-x-6 gap-y-2 text-sm text-grafito">
        {Object.entries(LEGAL).map(([slug, other]) => (
          <Link key={slug} href={`/legal/${slug}`} className="hover:text-tela">
            {other.title.replace(/\.$/, "")}
          </Link>
        ))}
      </nav>
    </main>
  );
}
