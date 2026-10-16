# Parlantes AIBIMY Storefront

Tienda headless en Next.js (App Router + Tailwind) para los parlantes AIBIMY publicados en Shopify por la integración con Dropi.

## Cómo funciona

- Los productos se leen de la Storefront API de Shopify con la búsqueda `SHOPIFY_PRODUCT_QUERY` (por defecto `vendor:Aibimy AND product_type:Parlantes`).
- El carrito vive en el navegador. Al pagar, `/api/checkout` valida las variantes contra Shopify, crea un carrito con `cartCreate` y redirige al checkout de Shopify.
- El pedido queda en Shopify como cualquier otro, así que Dropi lo recibe sin cambios.

## Diseño, fotos y ornamentos

- Dirección de arte (paleta, tipografía, layout, movimiento): [`docs/direccion-de-arte.md`](docs/direccion-de-arte.md).
- **Fotos sin fondo:** `public/products/<handle>/<vista>.webp` son las fotos de Shopify de la tienda, recortadas con rembg (`isnet-general-use`; BiRefNet para los casos difíciles) y guardadas en WebP con transparencia. `lib/product-photos.ts` lista las vistas y sus medidas. Un producto nuevo sin recortes usa sus fotos de Shopify tal cual.
- **Scroll de la portada** (Lenis + GSAP ScrollTrigger): cinco capítulos fijados con el MY274BT; la foto flota, se acerca al panel de luz, gira a la vista de atrás y se junta con su pareja. Los titulares se revelan por palabras.
- **Línea:** los cinco modelos en el mismo piso, a escala con las medidas del fabricante (`size` en `lib/catalog.ts`); al pasar el cursor se ven desde otro ángulo.
- **Ficha:** galería con giro entre vistas, zoom con clic o toque, y barra de compra fija en móvil.
- **Ornamentos 3D** (`components/three/ornaments.tsx`): anillos de sonido, polvo de luz, lluvia y paneles de acrílico con bordes iluminados. Un solo canvas fijo *detrás* del contenido; nunca tapan fotos ni texto. No se cargan con "reducir movimiento" ni sin WebGL.
- Las cifras del catálogo salen de las descripciones de Shopify; lo que el fabricante no confirma queda en `null` y se muestra como "—".

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
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |
