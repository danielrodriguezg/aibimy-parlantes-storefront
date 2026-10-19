import { codEnabled } from "@/lib/store";

type Step = { title: string; body: string; tone: string };

const COD_STEPS: Step[] = [
  { title: "Lo pides", body: "Con tu nombre, celular y dirección. Sin tarjeta.", tone: "#cbbeff" },
  { title: "Te confirmamos", body: "Te escribimos por WhatsApp antes de despachar.", tone: "#fbc3d9" },
  { title: "Pagas al recibir", body: "En efectivo, cuando el parlante llega a tu casa.", tone: "#fccfa8" }
];

const ONLINE_STEPS: Step[] = [
  { title: "Lo eliges", body: "Compara los cinco modelos y agrégalo al carrito.", tone: "#cbbeff" },
  { title: "Pagas seguro", body: "En el checkout de Shopify, con los medios que allí aparecen.", tone: "#fbc3d9" },
  { title: "Llega a tu casa", body: "Envío a toda Colombia, con guía para seguirlo.", tone: "#fccfa8" }
];

/**
 * Three numbered steps on soft pastel cards over a dark base, after the modular-card reference.
 * With cash on delivery on, the steps are the cash-on-delivery flow.
 */
export function HowItWorks() {
  const steps = codEnabled ? COD_STEPS : ONLINE_STEPS;
  return (
    <section id="como-funciona" className="scroll-mt-20 px-5 pt-20 sm:px-10">
      <div className="mx-auto max-w-7xl rounded-[36px] bg-noche p-3 sm:p-4">
        <div className="rounded-[28px] bg-crema px-6 pt-6 pb-8 sm:px-10 sm:pt-8">
          <div className="mono-label flex justify-between gap-4 text-grafito">
            <span>Cómo funciona</span>
            <span className="text-right">{codEnabled ? "Pago contra entrega" : "Compra en línea"}</span>
          </div>
          <h2 className="display mt-8 max-w-[16ch] text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.055em]">
            {codEnabled ? "pídelo hoy, págalo cuando llegue." : "del carrito a tu puerta."}
          </h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex min-h-48 flex-col rounded-[24px] p-6" style={{ backgroundColor: step.tone }}>
                <span className="mono-label text-tela/70">{String(index + 1).padStart(2, "0")}</span>
                <span className="display mt-auto text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none tracking-[-0.05em]">{step.title}</span>
                <span className="mt-2 text-sm text-tela/75">{step.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
