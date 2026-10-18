import Image from "next/image";
import Link from "next/link";
import { getSpec, type SpeakerSpec } from "@/lib/catalog";
import { heroPhoto } from "@/lib/product-photos";

type Pick = { handle: string; spec: SpeakerSpec };
type UseCase = { title: string; body: string; picks: Pick[]; tone: string };

const volume = (spec: SpeakerSpec) => spec.size.reduce((a, b) => a * b, 1);

/**
 * "Which one is for me?": the line sorted by what people search for (party, pool and beach,
 * something to carry), picked from the catalog facts rather than hand-written.
 */
export function UseCases({ handles }: { handles: string[] }) {
  const all: Pick[] = handles.map((handle) => ({ handle, spec: getSpec(handle) }));
  const byPower = [...all].filter((pick) => pick.spec.powerW).sort((a, b) => b.spec.powerW! - a.spec.powerW!);
  const waterproof = all.filter((pick) => pick.spec.water === "IPX6").sort((a, b) => volume(a.spec) - volume(b.spec));
  const compact = [...all].sort((a, b) => volume(a.spec) - volume(b.spec));

  const cases: UseCase[] = [];
  if (byPower.length)
    cases.push({
      title: "para la fiesta.",
      body: `Más vatios, más volumen. El ${byPower[0].spec.code} llega a ${byPower[0].spec.powerW} W.`,
      picks: byPower.slice(0, 2),
      tone: "#cbbeff"
    });
  if (waterproof.length)
    cases.push({
      title: "piscina y playa.",
      body: "Con IPX6 aguantan salpicaduras y chorros de agua. No son para sumergir.",
      picks: waterproof.slice(0, 3),
      tone: "#bfd6f6"
    });
  if (compact.length)
    cases.push({
      title: "para llevar.",
      body: "Los más pequeños de la línea, para llevar en la mano o en el morral.",
      picks: compact.slice(0, 2),
      tone: "#fccfa8"
    });
  if (!cases.length) return null;

  return (
    <section className="px-5 pt-20 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="display display-l mb-12 max-w-[14ch]">¿cuál es para ti?</h2>
        <ul className="grid gap-5 md:grid-cols-3">
          {cases.map((useCase, index) => (
            <li key={useCase.title} className="flex flex-col rounded-[32px] bg-white p-6 sm:p-8">
              <span className="mono-label mb-4 flex justify-between text-niebla">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{useCase.picks.length} {useCase.picks.length === 1 ? "modelo" : "modelos"}</span>
              </span>
              <div className="relative mb-6 flex h-48 items-end justify-center gap-2">
                <div className="arch absolute inset-x-[12%] top-[14%] bottom-0" style={{ backgroundColor: useCase.tone }} aria-hidden />
                {useCase.picks.map(({ handle, spec }) => {
                  const photo = heroPhoto(handle);
                  return photo ? (
                    <div key={handle} className="relative w-[34%]" style={{ height: `${Math.min(92, 40 + spec.size[1] * 22)}%` }}>
                      <Image src={photo.src} alt="" fill sizes="12vw" className="cutout object-contain object-bottom" />
                    </div>
                  ) : null;
                })}
              </div>
              <h3 className="display display-s">{useCase.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-grafito">{useCase.body}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {useCase.picks.map(({ handle, spec }) => (
                  <Link
                    key={handle}
                    href={`/parlantes/${handle}`}
                    className="rounded-full border border-tela/15 px-4 py-2 text-sm font-medium transition-colors hover:border-tela hover:bg-tela hover:text-white"
                  >
                    Ver el {spec.code}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
