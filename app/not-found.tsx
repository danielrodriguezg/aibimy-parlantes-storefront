import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-8 px-5 py-32 text-center">
      <h1 className="display display-m">no encontramos esta página.</h1>
      <Link href="/" className="rounded-full bg-tela px-8 py-4 font-medium text-white transition-transform hover:-translate-y-0.5">
        Volver al inicio
      </Link>
    </main>
  );
}
