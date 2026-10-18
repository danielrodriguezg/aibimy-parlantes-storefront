import type { Metadata } from "next";
import Link from "next/link";
import { Field, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Envíos" };

export default function ShippingPage() {
  return (
    <LegalPage title="Envíos" updated="18 de octubre de 2026">
      {(seller) => (
        <>
          <h2>A dónde enviamos</h2>
          <p>A toda Colombia, a través de transportadoras nacionales de nuestro aliado logístico.</p>

          <h2>Cuánto cuesta</h2>
          <p>
            El costo depende de tu ciudad y se calcula en el checkout, antes de pagar. Siempre lo ves antes de confirmar la
            compra.
          </p>

          <h2>Cuánto tarda</h2>
          <p>
            El tiempo estimado de entrega es <Field value={seller.shippingTime} label="Tiempo de entrega" />, contados desde
            la confirmación del pago. Puede variar en zonas rurales o de difícil acceso, en temporadas altas o por causas de la
            transportadora; si pasa, te avisamos.
          </p>

          <h2>Seguimiento</h2>
          <p>
            Cuando tu pedido sale, te enviamos el número de guía para que sigas el envío. Si tienes dudas, escríbenos a{" "}
            <Field value={seller.email} label="Correo" /> o al WhatsApp <Field value={seller.whatsapp} label="WhatsApp" />.
          </p>

          <h2>Al recibir</h2>
          <p>
            Revisa el paquete frente a la transportadora. Si llega abierto o golpeado, déjalo anotado en la guía y escríbenos
            ese mismo día con fotos. Lo que puedes hacer si el producto llega con fallas está en{" "}
            <Link href="/devoluciones">Garantía y devoluciones</Link>.
          </p>
        </>
      )}
    </LegalPage>
  );
}
