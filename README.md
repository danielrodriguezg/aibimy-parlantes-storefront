# Parlantes AIBIMY Storefront

Tienda headless en Next.js (App Router + Tailwind) para los parlantes AIBIMY publicados en Shopify por la integración con Dropi.

## Cómo funciona

- Los productos se leen de la Storefront API de Shopify con la búsqueda `SHOPIFY_PRODUCT_QUERY` (por defecto `vendor:Aibimy AND product_type:Parlantes`).
- El carrito vive en el navegador. Al pagar, `/api/checkout` valida las variantes contra Shopify, crea un carrito con `cartCreate` y redirige al checkout de Shopify.
- El pedido queda en Shopify como cualquier otro, así que Dropi lo recibe sin cambios.

## Diseño y 3D

- Dirección de arte (paleta, tipografía, layout, movimiento): [`docs/direccion-de-arte.md`](docs/direccion-de-arte.md).
- Un solo canvas WebGL para todo el sitio (`components/three/scene-canvas.tsx`); cada zona 3D es un `View` de drei que sigue su elemento en la página.
- Los parlantes son modelos procedurales en three.js (`components/three/speaker-models.tsx`) con la forma, tamaño y datos de `lib/catalog.ts`.
- **Modelos reales:** si pones `public/models/<handle>.glb` (por ejemplo `public/models/parlante-aibimy-my362bt-bluetooth-30w.glb`), el sitio usa ese archivo en lugar del procedural, sin cambiar código. Se escala a la altura del catálogo. Comprímelo (Draco/KTX2) y mantenlo por debajo de ~1.5 MB.
- El scroll de la portada (Lenis + GSAP ScrollTrigger) mueve la cámara por cinco capítulos. Con "reducir movimiento" activado no hay scroll suave ni animación automática; sin WebGL se muestran las fotos de Shopify.
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
