"use client";

import { useId, useState, type ReactNode } from "react";

export type AccordionItem = { id: string; title: string; content: ReactNode };

/** Thin-ruled sections with a plus that turns into a minus; one open at a time. */
export function Accordion({ items, defaultOpen }: { items: AccordionItem[]; defaultOpen?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const baseId = useId();

  return (
    <div className="border-t border-tinta/12">
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className="border-b border-tinta/12">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className={`flex w-full items-center justify-between gap-4 py-5 text-left text-xl tracking-tight transition-colors ${
                  isOpen ? "text-tinta" : "text-gris hover:text-tinta"
                }`}
              >
                {item.title}
                <span className="relative h-4 w-4 shrink-0" aria-hidden>
                  <span className="absolute top-1/2 left-0 h-[1.5px] w-4 -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute top-1/2 left-0 h-[1.5px] w-4 -translate-y-1/2 bg-current transition-transform duration-300 ${
                      isOpen ? "rotate-0" : "rotate-90"
                    }`}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-6 text-[0.975rem] leading-relaxed text-gris">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
