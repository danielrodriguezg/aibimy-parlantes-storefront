/**
 * Floating WhatsApp button: in Colombia most pre-sale questions go through WhatsApp. Shown only
 * when SELLER_WHATSAPP is set, so it never links to a placeholder.
 */
export function WhatsAppButton({ number }: { number: string | null }) {
  if (!number) return null;
  const text = encodeURIComponent("Hola, tengo una pregunta sobre los parlantes AIBIMY.");
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="chip fixed right-5 bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white transition-transform hover:-translate-y-0.5 lg:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z" />
      </svg>
    </a>
  );
}
