import Link from "next/link";
import { AccordionItem } from "@/components/ui/accordion";
import { faqJsonLd, type Faq } from "@/lib/faq";
import { JsonLd } from "@/lib/seo";

/** Questions as an accordion, plus the FAQPage data Google reads for rich results. */
export function FaqSection({ faqs, title, group }: { faqs: Faq[]; title: string; group: string }) {
  if (!faqs.length) return null;
  return (
    <section id="preguntas" className="scroll-mt-20 px-5 py-20 sm:px-10">
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 className="display display-l max-w-[11ch]">{title}</h2>
          <p className="lede mt-6 text-grafito">Lo que más nos preguntan antes de elegir un parlante.</p>
        </div>
        <div>
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} title={faq.question} group={group} open={index === 0}>
              {faq.answer}
              {faq.link && (
                <>
                  {" "}
                  <Link href={faq.link.href} className="text-tela underline underline-offset-4">
                    {faq.link.label}
                  </Link>
                </>
              )}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
