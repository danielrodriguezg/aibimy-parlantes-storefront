import type { Metadata } from "next";
import { Field, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Garantía y devoluciones" };

export default function ReturnsPage() {
  return (
    <LegalPage title="Garantía y devoluciones" updated="18 de octubre de 2026">
      {(seller) => (
        <>
          <p>
            Estos son tus derechos según el Estatuto del Consumidor (Ley 1480 de 2011). Para cualquiera de ellos, escríbenos
            a <Field value={seller.email} label="Correo" /> o al WhatsApp <Field value={seller.whatsapp} label="WhatsApp" />{" "}
            con tu número de pedido.
          </p>

          <h2>Derecho de retracto: 5 días hábiles</h2>
          <ul>
            <li>Puedes arrepentirte de la compra dentro de los 5 días hábiles siguientes a la entrega.</li>
            <li>El producto debe estar en el mismo estado en que lo recibiste, con su caja y accesorios.</li>
            <li>Los costos de transporte de la devolución corren por tu cuenta, como indica la ley.</li>
            <li>Te devolvemos todo lo que pagaste en máximo 30 días calendario desde que ejerces el retracto.</li>
          </ul>

          <h2>Garantía legal</h2>
          <ul>
            <li>
              Todos los productos tienen garantía legal por defectos de calidad o de funcionamiento durante 1 año desde la
              entrega, salvo que en la ficha del producto se indique un plazo mayor.
            </li>
            <li>
              Si el producto falla, lo reparamos sin costo. Si la falla se repite o no tiene arreglo, te lo cambiamos por uno
              igual o te devolvemos el dinero.
            </li>
            <li>
              Para pedirla, escríbenos con tu número de pedido, una descripción de la falla y fotos o un video. Respondemos en
              máximo 15 días hábiles.
            </li>
            <li>
              No cubre daños por mal uso, golpes, humedad más allá de la protección anunciada (IPX6 no es para sumergir) ni
              reparaciones hechas por terceros.
            </li>
          </ul>

          <h2>Reversión del pago</h2>
          <p>
            Si pagaste con un medio electrónico (tarjeta de crédito, débito u otro), puedes pedir la reversión del pago en
            estos casos: fuiste víctima de fraude, la operación no fue solicitada, el producto no llegó, o no corresponde a lo
            que pediste o tiene defectos.
          </p>
          <p>
            Tienes 5 días hábiles desde que conociste el problema para presentar la queja ante nosotros y avisar al emisor de
            tu medio de pago, que hará la reversión.
          </p>

          <h2>Peticiones, quejas y reclamos</h2>
          <p>
            Si no quedas conforme con nuestra respuesta, puedes acudir a la Superintendencia de Industria y Comercio
            (www.sic.gov.co).
          </p>
        </>
      )}
    </LegalPage>
  );
}
