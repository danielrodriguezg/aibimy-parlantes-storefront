import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 pt-40 pb-24 text-center">
      <h1 className="display display-m mb-4">No encontramos esta página</h1>
      <Link href="/" className="underline">
        Volver al inicio
      </Link>
    </main>
  );
}
