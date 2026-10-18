import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { codEnabled } from "@/lib/store";

/**
 * The closing brand moment, after the modular-card reference: a giant cropped wordmark on a
 * lavender card, a ring-and-dot mark (sound and its light), and the promise with the call to action.
 */
export function BrandClose() {
  return (
    <section className="px-5 py-24 sm:px-10">
      <div className="mx-auto grid max-w-7xl gap-3 rounded-[36px] bg-noche p-3 sm:p-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="relative flex min-h-72 flex-col justify-between overflow-hidden rounded-[28px] bg-lavanda p-6 sm:min-h-96 sm:p-8">
          <span className="mono-label self-end text-tela/70">01</span>
          <p
            className="wordmark -mb-[0.2em] -ml-[0.06em] text-[clamp(4.5rem,11.5vw,10.5rem)] leading-[0.8] tracking-[-0.06em] whitespace-nowrap text-tela"
            aria-hidden
          >
            luzunido
          </p>
          <span className="mono-label self-end text-tela/70">luzunido.co</span>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col gap-6 rounded-[28px] bg-crema p-6 sm:p-8">
            <div className="mono-label flex justify-between gap-4 text-grafito">
              <span>Luzunido</span>
              <span className="text-right">Parlantes AIBIMY originales</span>
            </div>
            <h2 className="display text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[0.95] tracking-[-0.055em]">el sonido también se ve.</h2>
            <Link
              href="#linea"
              className="flex items-center gap-3 self-start rounded-full bg-tela py-4 pr-6 pl-8 font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Elegir mi parlante
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex items-center gap-5 rounded-[28px] bg-durazno p-6 sm:p-8">
            {/* Ring and dot: the sound and the light that comes out of it. */}
            <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-[20px] bg-noche" aria-hidden>
              <span className="h-8 w-8 rounded-full border-[6px] border-caucho" />
              <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-lavanda" />
            </span>
            <div>
              <p className="font-semibold">{codEnabled ? "Envío a toda Colombia y pago al recibir" : "Envío a toda Colombia"}</p>
              <p className="text-sm text-tela/75">
                {codEnabled ? "Pides con tu celular y pagas en efectivo cuando llega." : "El costo se calcula según tu ciudad, antes de pagar."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
