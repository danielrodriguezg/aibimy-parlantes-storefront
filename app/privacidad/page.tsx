import type { Metadata } from "next";
import { Field, LegalPage, SellerCard } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacidad y tratamiento de datos" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacidad y tratamiento de datos" updated="18 de octubre de 2026">
      {(seller) => (
        <>
          <p>
            Esta política explica cómo tratamos tus datos personales, según la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>

          <h2>Responsable del tratamiento</h2>
          <SellerCard seller={seller} />

          <h2>Qué datos recogemos</h2>
          <ul>
            <li>Los que das al comprar: nombre, documento, correo, teléfono y dirección de entrega.</li>
            <li>Los que nos escribes por correo o WhatsApp.</li>
            <li>
              El contenido de tu carrito, que se guarda solo en tu navegador hasta que pagas o lo vacías. No lo enviamos a
              ningún servidor hasta que vas a pagar.
            </li>
          </ul>
          <p>No recibimos ni guardamos los datos de tu tarjeta: el pago lo procesa el checkout de Shopify y su pasarela.</p>

          <h2>Para qué los usamos</h2>
          <ul>
            <li>Procesar tu pedido, entregarlo y facturarlo.</li>
            <li>Atender garantías, devoluciones, peticiones, quejas y reclamos.</li>
            <li>Enviarte novedades u ofertas, solo si lo autorizas de forma expresa. Puedes retirar ese permiso cuando quieras.</li>
          </ul>

          <h2>Con quién los compartimos</h2>
          <p>Solo con quienes los necesitan para cumplir tu pedido, que los tratan por nuestra cuenta:</p>
          <ul>
            <li>Shopify, que opera el checkout y guarda los pedidos.</li>
            <li>Nuestro aliado logístico y la transportadora, para preparar y entregar el envío.</li>
            <li>Vercel, que aloja este sitio.</li>
          </ul>
          <p>
            Si en el futuro usamos herramientas de medición o publicidad (como el píxel de Meta), te pediremos permiso antes
            de activarlas y lo diremos aquí.
          </p>

          <h2>Tus derechos</h2>
          <p>
            Puedes conocer, actualizar, rectificar y pedir que suprimamos tus datos, revocar la autorización y pedir prueba de
            ella, saber qué uso les hemos dado y presentar quejas ante la Superintendencia de Industria y Comercio.
          </p>

          <h2>Cómo ejercerlos</h2>
          <p>
            Escríbenos a <Field value={seller.email} label="Correo" /> con tu nombre, tu documento y lo que pides.
            Respondemos las consultas en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles, como manda la ley.
          </p>

          <h2>Vigencia</h2>
          <p>
            Guardamos tus datos mientras sean necesarios para las finalidades descritas y para cumplir obligaciones legales,
            como las contables y tributarias.
          </p>
        </>
      )}
    </LegalPage>
  );
}
