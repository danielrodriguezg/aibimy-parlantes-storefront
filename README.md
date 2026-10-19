# Luzunido · Parlantes AIBIMY

Luzunido es la tienda; AIBIMY es la marca de los parlantes que vende. Tienda headless en Next.js (App Router + Tailwind) para los parlantes AIBIMY publicados en Shopify por la integración con Dropi.

## Cómo funciona

- Los productos se leen de la Storefront API de Shopify con la búsqueda `SHOPIFY_PRODUCT_QUERY` (por defecto `vendor:Aibimy AND product_type:Parlantes`).
- El carrito vive en el navegador. Al pagar, `/api/checkout` valida las variantes contra Shopify, crea un carrito con `cartCreate` y redirige al checkout de Shopify.
- El pedido queda en Shopify como cualquier otro, así que Dropi lo recibe sin cambios.

## Diseño y fotos

- Dirección de arte (paleta, tipografía, layout, movimiento): [`docs/direccion-de-arte.md`](docs/direccion-de-arte.md).
- **Fotos sin fondo:** `public/products/<handle>/<vista>.webp` son las fotos de Shopify de la tienda, recortadas con rembg (`isnet-general-use`; BiRefNet para los casos difíciles) y guardadas en WebP con transparencia. `lib/product-photos.ts` lista las vistas y sus medidas. Un producto nuevo sin recortes usa sus fotos de Shopify tal cual.
- **Portada:** un showcase de estudio claro. Cada modelo aparece en su arco de color, con flechas para recorrer la línea, chips con sus cifras confirmadas, precio, botón de compra y un acordeón con descripción, especificaciones y envío (`components/home/hero-showcase.tsx`).
- **Línea:** los cinco modelos en el mismo piso, a escala con las medidas del fabricante (`size` en `lib/catalog.ts`); al pasar el cursor se ven desde otro ángulo.
- **Ficha:** galería con giro entre vistas, zoom con clic o toque, y barra de compra fija en móvil.
- **Trazos a mano** (`components/ui/scribble.tsx`): el óvalo naranja alrededor de una palabra, la flecha y el lazo blanco sobre el producto se dibujan solos una vez; con "reducir movimiento" aparecen ya dibujados.
- Las cifras del catálogo salen de las descripciones de Shopify; lo que el fabricante no confirma queda en `null` y se muestra como "—".

## Pago contra entrega

"Pídelo y paga al recibir" (portada, ficha y carrito) abre un formulario corto: nombre, celular, departamento, ciudad, dirección y barrio. `/api/cod` valida los datos (celular colombiano, departamento válido, campo trampa contra bots, 4 pedidos por hora por IP, mismo origen), toma los precios de Shopify y crea el pedido con la Admin API: pago pendiente, etiqueta `contraentrega` y nota "Pago contra entrega". Dropi lo importa y la transportadora cobra al entregar.

Antes de activarlo (`NEXT_PUBLIC_COD_ENABLED=true` y `COD_ORDERS_ENABLED=true`): conecta Dropi a la tienda propia, confirma en Dropi que los pedidos con pago pendiente y etiqueta `contraentrega` entran como contra entrega, y haz un pedido de prueba. Mientras el checkout esté apagado (`NEXT_PUBLIC_CHECKOUT_ENABLED`), el formulario tampoco aparece.

## Desarrollo

```bash
cp .env.example .env.local   # completa el token de Storefront
npm install
npm run dev
```

## Variables

| Variable | Uso |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Dominio `.myshopify.com` de la tienda |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Token público de Storefront API |
| `SHOPIFY_STOREFRONT_API_VERSION` | Versión de la API (por defecto `2025-07`) |
| `SHOPIFY_PRODUCT_QUERY` | Qué productos se venden aquí (sintaxis de búsqueda de Shopify) |
| `SHOPIFY_REVALIDATE_SECONDS` | Cada cuánto se refresca el catálogo |
| `NEXT_PUBLIC_CHECKOUT_ENABLED` | `true` para recibir pedidos en producción. Sin esto, un deploy muestra el catálogo con un aviso de pruebas, no se indexa y no crea checkouts (en desarrollo siempre funciona) |
| `NEXT_PUBLIC_COD_ENABLED` | `true` para ofrecer pago contra entrega en producción (en desarrollo siempre aparece). Muestra el formulario "Pídelo y paga al recibir" y la promesa en el sitio |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Token de Admin API con `write_orders` de la tienda que vende. Crea los pedidos contra entrega (pago pendiente, etiqueta `contraentrega`). **Secreto**: solo en el servidor |
| `COD_ORDERS_ENABLED` | `true` para que `/api/cod` cree pedidos reales. Sin esto (también en desarrollo) responde "todavía no está habilitado", aunque haya token: así nunca se crean pedidos en una tienda prestada |
| `NEXT_PUBLIC_COD_SHIPPING_FEE` | Envío contra entrega en COP; si está vacío se confirma por WhatsApp |
| `SELLER_*` | Datos del vendedor (quien cobra y factura) para las páginas legales; ver `.env.example`. Si falta alguno, las páginas salen como borrador |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |
