import Image from "next/image";
import { HighlightIcon } from "@/components/ui/icons";
import { getSpec, type Highlight } from "@/lib/catalog";
import { PHOTOS } from "@/lib/product-photos";

type Feature = { icon: Highlight["icon"]; title: string; body: string; photo: { src: string }; tone: string };

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/**
 * What the line shares, counted from the catalog so the copy stays true when products change.
 * Each card is a small arch with the photo that shows that feature best.
 */
export function Features({ handles }: { handles: string[] }) {
  const specs = handles.map(getSpec);
  const rgb = specs.filter((spec) => spec.rgb).length;
  const ipx6 = specs.filter((spec) => spec.water === "IPX6").length;
  const tws = specs.filter((spec) => spec.tws).length;
  const strongest = specs.reduce<number>((max, spec) => Math.max(max, spec.powerW ?? 0), 0);

  const features: Feature[] = [];
  const top = PHOTOS["parlante-aibimy-my264bt-bluetooth-rgb"]?.top;
  if (rgb && top)
    features.push({
      icon: "light",
      title: "luz que suena.",
      body: `Paneles de luz RGB en ${rgb} ${plural(rgb, "modelo", "modelos")}. Sobre la mesa se ven desde cualquier lado.`,
      photo: top,
      tone: "#bfd6f6"
    });
  const back = PHOTOS["parlante-aibimy-my274bt-bluetooth-40w"]?.back;
  if (strongest && back)
    features.push({
      icon: "bolt",
      title: `hasta ${strongest} W.`,
      body: "El MY274BT trae bajos reforzados y una batería de 5400 mAh para pasar la tarde sin cable.",
      photo: back,
      tone: "#cbbeff"
    });
  const front = PHOTOS["parlante-aibimy-my362bt-bluetooth-30w"]?.["front-34"];
  if (ipx6 && front)
    features.push({
      icon: "drop",
      title: "aguanta la lluvia.",
      body: `Protección IPX6 anunciada en ${ipx6} ${plural(ipx6, "modelo", "modelos")}: salpicaduras y chorros de agua, no para sumergirlo.`,
      photo: front,
      tone: "#fbc3d9"
    });
  const pair = PHOTOS["parlante-aibimy-my268bt-bluetooth-20w"]?.pair;
  if (tws && pair)
    features.push({
      icon: "pair",
      title: "dos suenan mejor.",
      body: `Con TWS enlazas dos parlantes del mismo modelo y escuchas en estéreo. Lo traen ${tws === specs.length ? "todos" : tws}.`,
      photo: pair,
      tone: "#fccfa8"
    });

  if (!features.length) return null;

  return (
    <section className="px-5 py-24 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="display display-l mb-14 max-w-[14ch]">lo que traen.</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {features.map((feature, index) => (
            <li key={feature.title} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-4 rounded-[32px] bg-white p-6 sm:p-8">
              <div className="flex h-full flex-col gap-4 pb-2">
                <span className="mono-label text-niebla">{String(index + 1).padStart(2, "0")}</span>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-caucho-suave text-caucho">
                  <HighlightIcon icon={feature.icon} className="h-6 w-6" />
                </span>
                <h3 className="display display-s mt-auto">{feature.title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-grafito">{feature.body}</p>
              </div>
              <div className="relative aspect-[4/5]">
                <div className="arch absolute inset-x-[8%] top-[18%] bottom-0" style={{ backgroundColor: feature.tone }} aria-hidden />
                <div className="absolute inset-x-[4%] top-[4%] bottom-[2%]">
                  <Image src={feature.photo.src} alt="" fill sizes="(min-width: 640px) 22vw, 45vw" className="cutout object-contain object-bottom" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-niebla">Cifras anunciadas por el fabricante.</p>
      </div>
    </section>
  );
}
