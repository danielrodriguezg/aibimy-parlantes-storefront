import { SELLER } from "@/lib/seller";

export type LegalDoc = { title: string; summary: string; body: React.ReactNode };

const seller = (
  <>
    {SELLER.legalName}, identificado con {SELLER.taxId}, con domicilio en {SELLER.city} ({SELLER.address}), correo{" "}
    {SELLER.email} y WhatsApp {SELLER.whatsapp}
  </>
);

/**
 * Legal pages under Colombian law: Estatuto del Consumidor (Ley 1480 de 2011), comercio electrónico
 * (Ley 527 de 1999) and personal data (Ley 1581 de 2012, Decreto 1377 de 2013). Drafts: a lawyer
 * reviews them before the store takes real orders.
 */
export const LEGAL: Record<string, LegalDoc> = {
  terminos: {
    title: "términos y condiciones.",
    summary: "Quién vende, cómo se paga y qué derechos tienes al comprar en Luzonido.",
    body: (
      <>
        <h2>Quién vende</h2>
        <p>
          Esta tienda en línea se llama {SELLER.brand} y la opera {seller}. Al comprar aceptas estos términos.
        </p>
        <h2>Los productos y la marca AIBIMY</h2>
        <p>
          Vendemos parlantes originales de la marca AIBIMY. AIBIMY es una marca de un tercero: {SELLER.brand} es un vendedor
          independiente y no es el fabricante ni su representante oficial. Las fotos son de los productos reales; las cifras
          técnicas (potencia, batería, resistencia al agua) son las que anuncia el fabricante.
        </p>
        <h2>Precios y pago</h2>
        <p>
          Los precios están en pesos colombianos e incluyen los impuestos aplicables. El costo de envío se muestra antes de
          pagar. El pago se procesa en el checkout de Shopify y en la pasarela de pago que allí elijas; {SELLER.brand} no
          ve ni guarda los datos de tu tarjeta. El pedido queda confirmado cuando recibes el correo de confirmación.
        </p>
        <h2>Disponibilidad</h2>
        <p>
          Si un producto se agota después de tu pago, te avisamos y te devolvemos el dinero completo por el mismo medio,
          o te ofrecemos otro modelo si lo prefieres.
        </p>
        <h2>Envío, retracto y garantía</h2>
        <p>
          Los tiempos y costos de envío, el derecho de retracto, la reversión del pago y la garantía legal se explican en las
          páginas de Envíos y de Devoluciones y garantía, que hacen parte de estos términos.
        </p>
        <h2>Peticiones, quejas y reclamos</h2>
        <p>
          Escríbenos a {SELLER.email} o al WhatsApp {SELLER.whatsapp}. Respondemos en un máximo de 15 días hábiles. Si no
          quedas conforme, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).
        </p>
        <h2>Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de Colombia, en especial la Ley 1480 de 2011 (Estatuto del Consumidor).</p>
      </>
    )
  },
  privacidad: {
    title: "privacidad y datos.",
    summary: "Qué datos tuyos usamos, para qué, y cómo ejercer tus derechos (Ley 1581 de 2012).",
    body: (
      <>
        <h2>Responsable del tratamiento</h2>
        <p>{seller}.</p>
        <h2>Qué datos tratamos</h2>
        <ul>
          <li>Los que das al comprar: nombre, documento, correo, teléfono y dirección de entrega.</li>
          <li>Los de tu pedido: productos, valor y estado del envío.</li>
          <li>
            Datos de navegación (cookies y píxeles de medición, como el de Meta) solo si los aceptas en el aviso de cookies.
          </li>
        </ul>
        <p>No guardamos datos de tarjetas: los recibe directamente la pasarela de pago.</p>
        <h2>Para qué</h2>
        <ul>
          <li>Procesar y entregar tu pedido, y atender garantías y reclamos.</li>
          <li>Cumplir obligaciones legales, contables y tributarias.</li>
          <li>Si lo autorizas, enviarte novedades y mostrarte anuncios relacionados con nuestros productos.</li>
        </ul>
        <h2>Con quién los compartimos</h2>
        <p>
          Con los encargados que hacen posible la compra: Shopify (tienda y checkout, con servidores fuera de Colombia),
          Dropi y la transportadora (despacho y entrega), y la pasarela de pago. Cada uno los usa solo para esa función.
        </p>
        <h2>Tus derechos</h2>
        <p>
          Puedes conocer, actualizar, rectificar y suprimir tus datos, pedir prueba de tu autorización y revocarla, escribiendo a{" "}
          {SELLER.email}. Las consultas se responden en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles. También
          puedes acudir a la Superintendencia de Industria y Comercio.
        </p>
        <h2>Vigencia</h2>
        <p>Esta política rige desde {SELLER.updated}. Conservamos tus datos mientras sean necesarios para las finalidades descritas y lo que exija la ley.</p>
      </>
    )
  },
  envios: {
    title: "envíos.",
    summary: "A dónde enviamos, cuánto tarda y cuánto cuesta.",
    body: (
      <>
        <h2>Cobertura</h2>
        <p>Enviamos a toda Colombia con transportadoras aliadas.</p>
        <h2>Tiempos</h2>
        <p>
          Tu pedido sale de bodega en 1 a 2 días hábiles y llega en {SELLER.shippingTime} según tu ciudad. Las
          zonas rurales o de difícil acceso pueden tardar más; si es tu caso, te avisamos.
        </p>
        <h2>Costo</h2>
        <p>El valor del envío se calcula según tu ciudad y lo ves en el checkout antes de pagar.</p>
        <h2>Seguimiento</h2>
        <p>Cuando tu pedido sale, te enviamos la guía para que sigas el envío. Si algo se retrasa, escríbenos al {SELLER.whatsapp}.</p>
        <h2>Al recibir</h2>
        <p>Revisa el paquete frente al transportador. Si llega abierto o dañado, déjalo anotado en la guía y escríbenos el mismo día.</p>
      </>
    )
  },
  devoluciones: {
    title: "devoluciones y garantía.",
    summary: "Retracto, reversión del pago y garantía legal, según el Estatuto del Consumidor.",
    body: (
      <>
        <h2>Derecho de retracto</h2>
        <p>
          Por ser una compra a distancia, puedes retractarte dentro de los 5 días hábiles siguientes a la entrega (artículo 47
          de la Ley 1480 de 2011). El producto debe volver en el mismo estado en que lo recibiste. Los costos de transporte de
          la devolución corren por tu cuenta y te devolvemos el dinero en máximo 30 días calendario.
        </p>
        <h2>Reversión del pago</h2>
        <p>
          Si pagaste con tarjeta u otro medio electrónico y fuiste víctima de fraude, la compra no fue solicitada, el producto no
          llegó o no corresponde a lo pedido o tiene defectos, puedes pedir la reversión del pago (artículo 51 de la Ley 1480).
          Avísanos a {SELLER.email} y a tu banco o emisor dentro de los 5 días hábiles siguientes a que lo notes, y devuelve el
          producto si lo recibiste.
        </p>
        <h2>Garantía legal</h2>
        <p>
          Todos los productos tienen garantía legal por defectos de calidad o funcionamiento. Su término es el que indique el
          fabricante y, si no lo indica, 1 año desde la entrega (artículo 8 de la Ley 1480). Respondemos nosotros como
          vendedores: escríbenos con tu número de pedido, una descripción y fotos o video del problema. Revisamos el producto y lo
          reparamos, lo cambiamos o te devolvemos el dinero según corresponda.
        </p>
        <p>La garantía no cubre daños por golpes, uso indebido, inmersión en agua (la protección IPX6 es contra salpicaduras y chorros, no para sumergir) ni reparaciones hechas por terceros.</p>
        <h2>Cómo empezar</h2>
        <p>Escríbenos a {SELLER.email} o al WhatsApp {SELLER.whatsapp} con tu número de pedido.</p>
      </>
    )
  }
};
