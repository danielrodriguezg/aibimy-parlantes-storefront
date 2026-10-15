import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="mb-4 text-3xl font-black">No encontramos esta página</h1>
      <Link href="/" className="underline">
        Volver al inicio
      </Link>
    </main>
  );
}
