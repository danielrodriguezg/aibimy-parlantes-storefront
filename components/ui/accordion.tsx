import { Plus } from "@/components/ui/icons";

/**
 * One row of a native <details> accordion. Rows that share a `group` name open one at a time,
 * with no JavaScript.
 */
export function AccordionItem({
  title,
  group,
  open = false,
  children
}: {
  title: string;
  group: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details name={group} open={open} className="accordion group border-b border-tela/12">
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-lg text-grafito transition-colors group-open:text-tela hover:text-tela">
        {title}
        <span className="relative grid h-5 w-5 place-items-center" aria-hidden>
          <span className="absolute h-[1.8px] w-4 rounded bg-current" />
          <Plus className="accordion-plus absolute h-5 w-5" />
        </span>
      </summary>
      <div className="pb-6 text-[0.9375rem] leading-relaxed text-grafito">{children}</div>
    </details>
  );
}
