import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { formatMoney } from "@/lib/money";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Parlantes Bluetooth</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Sonido potente para cada plan.
          </h1>
          <p className="max-w-xl text-lg text-neutral-300">
            Elige tu parlante AIBIMY. Envío a toda Colombia y pago seguro.
          </p>
          <div>
            <Link
              href="#parlantes"
              className="inline-block rounded-full bg-amber-400 px-8 py-4 font-bold text-neutral-950 hover:bg-amber-300"
            >
              Ver parlantes
            </Link>
          </div>
        </div>
      </section>

      <section id="parlantes" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="mb-8 text-3xl font-black">Elige tu parlante</h2>
        {products.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            {isShopifyConfigured()
              ? "No encontramos parlantes publicados en la tienda."
              : "Configura SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_ACCESS_TOKEN para cargar los parlantes."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {products.length > 1 && (
        <section id="comparar" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-8">
          <h2 className="mb-8 text-3xl font-black">Compara los modelos</h2>
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-neutral-100 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Modelo</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Opciones</th>
                  <th className="px-4 py-3 font-semibold">Disponible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/parlantes/${product.handle}`} className="hover:underline">
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatMoney(product.priceRange.minVariantPrice)}</td>
                    <td className="px-4 py-3">{product.variants.length > 1 ? product.variants.map((v) => v.title).join(", ") : "Único"}</td>
                    <td className="px-4 py-3">{product.availableForSale ? "Sí" : "Agotado"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
