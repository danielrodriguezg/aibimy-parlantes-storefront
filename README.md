# Parlantes AIBIMY Storefront

Tienda headless en Next.js (App Router + Tailwind) para los parlantes AIBIMY publicados en Shopify por la integración con Dropi.

## Cómo funciona

- Los productos se leen de la Storefront API de Shopify con la búsqueda `SHOPIFY_PRODUCT_QUERY` (por defecto `vendor:Aibimy AND product_type:Parlantes`).
- El carrito vive en el navegador. Al pagar, `/api/checkout` valida las variantes contra Shopify, crea un carrito con `cartCreate` y redirige al checkout de Shopify.
- El pedido queda en Shopify como cualquier otro, así que Dropi lo recibe sin cambios.

## Diseño y fotos

- Dirección de arte (paleta, tipografía, layout, movimiento): [`docs/direccion-de-arte.md`](docs/direccion-de-arte.md). Estilo clean de estudio: fondo claro, el producto frente a un arco de color y trazos naranjas a mano.
- **Fotos sin fondo:** `public/products/<handle>/<vista>.webp` son las fotos de Shopify de la tienda, recortadas con rembg (`isnet-general-use`; BiRefNet para los casos difíciles) y guardadas en WebP con transparencia. `lib/product-photos.ts` lista las vistas y sus medidas. Un producto nuevo sin recortes usa sus fotos de Shopify tal cual.
- **Portada:** vitrina con los cinco modelos (`components/home/hero-showcase.tsx`): flechas para cambiar de modelo, fichas con sus cifras, acordeón de detalles y compra directa. El escenario del producto (arco, línea, esferas, fichas) está en `components/stage/product-stage.tsx`.
- **Línea:** los cinco modelos en el mismo piso, a escala con las medidas del fabricante (`size` en `lib/catalog.ts`); al pasar el cursor se ven desde otro ángulo.
- **Ficha:** el mismo esquema que la portada con las vistas del producto, acordeón con descripción y especificaciones, y barra de compra fija en móvil.
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
