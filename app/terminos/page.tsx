import type { Metadata } from "next";
import Link from "next/link";
import { Field, LegalPage, SellerCard } from "@/components/legal-page";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <LegalPage title="Términos y condiciones" updated="18 de octubre de 2026">
      {(seller) => (
        <>
          <h2>Quién vende</h2>
          <p>
            Esta tienda en línea se llama {seller.store}. El vendedor, quien recibe el pago y responde por tu compra, es:
          </p>
          <SellerCard seller={seller} />
          <p>
            {seller.store} vende parlantes de la marca AIBIMY. No somos el fabricante ni representantes oficiales de AIBIMY;
            el nombre de la marca se usa solo para identificar el producto que vendemos.
          </p>

          <h2>Productos y cifras</h2>
          <p>
            Las especificaciones (potencia, batería, resistencia al agua, conectividad) son las que anuncia el fabricante. Las
            fotos son del producto real; el color de las luces puede verse distinto según tu pantalla.
          </p>

          <h2>Precios y pago</h2>
          <ul>
            <li>Los precios están en pesos colombianos (COP) e incluyen los impuestos aplicables.</li>
            <li>El costo del envío se calcula antes de pagar, según tu ciudad, y lo ves antes de confirmar.</li>
            <li>
              El pago se hace en el checkout de Shopify con los medios que allí aparecen. No guardamos los datos de tu
              tarjeta.
            </li>
            <li>La compra queda confirmada cuando recibes el correo de confirmación del pedido.</li>
          </ul>

          <h2>Disponibilidad</h2>
          <p>
            El inventario lo maneja nuestro aliado logístico. Si después de tu pago un producto se agota, te avisamos y te
            devolvemos el dinero completo, o lo cambiamos por otro modelo si así lo prefieres.
          </p>

          <h2>Envío, retracto, garantía y reversión del pago</h2>
          <p>
            Los tiempos y costos de entrega están en <Link href="/envios">Envíos</Link>. Tus derechos de retracto, garantía
            legal y reversión del pago, y cómo ejercerlos, están en{" "}
            <Link href="/devoluciones">Garantía y devoluciones</Link>.
          </p>

          <h2>Datos personales</h2>
          <p>
            Tratamos tus datos según la <Link href="/privacidad">Política de privacidad y tratamiento de datos</Link>.
          </p>

          <h2>Peticiones, quejas y reclamos</h2>
          <p>
            Escríbenos a <Field value={seller.email} label="Correo" /> o al WhatsApp{" "}
            <Field value={seller.whatsapp} label="WhatsApp" />. Respondemos en un máximo de 15 días hábiles. Si no quedas
            conforme, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).
          </p>

          <h2>Ley aplicable</h2>
          <p>
            Estas condiciones se rigen por las leyes de Colombia, en particular el Estatuto del Consumidor (Ley 1480 de 2011)
            y las normas de comercio electrónico.
          </p>
        </>
      )}
    </LegalPage>
  );
}
