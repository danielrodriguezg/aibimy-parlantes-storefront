# Checklist para producción — Luzunido

Estado al 18 de octubre de 2026. ✅ hecho en el código · ⏳ depende de Daniel · ⬜ pendiente.

## Legal y marca
- ✅ Marca de tienda Luzunido; AIBIMY solo como marca del producto.
- ✅ Páginas legales en borrador (`/legal/*`) con datos del vendedor desde `SELLER_*`.
- ⏳ Registrar luzunido.co y @luzunido en Instagram; búsqueda de la marca en la SIC (clases 9 y 35).
- ⏳ RUT, registro mercantil y facturación electrónica si aplica (contador).
- ⏳ Llenar `SELLER_*` en Vercel y revisión de las páginas legales por un abogado.
- ⏳ Confirmar con Dropi o el proveedor el uso de las fotos en publicidad.
- ⬜ Aviso de cookies con consentimiento antes de cargar el Píxel de Meta (cuando se agregue analítica).

## Pagos y contra entrega
- ✅ Checkout de Shopify apagado en producción salvo `NEXT_PUBLIC_CHECKOUT_ENABLED=true`.
- ✅ Formulario "Pídelo y paga al recibir" + `/api/cod` (pedido en Shopify con pago pendiente y etiqueta `contraentrega`).
- ✅ Anti-fraude: celular colombiano, departamento válido, campo trampa, 4 pedidos/hora por IP, mismo origen.
- ✅ Interruptor `COD_ORDERS_ENABLED`: sin él no se crea ningún pedido, aunque haya token.
- ⏳ Shopify propio + pasarela (Wompi, Mercado Pago, PayU o ADDI) a tu cuenta.
- ⏳ Token de Admin API (`write_orders`) de tu tienda en `SHOPIFY_ADMIN_ACCESS_TOKEN`.
- ⏳ Verificar con Dropi que los pedidos `contraentrega` entran como contra entrega; pedido de prueba de punta a punta.
- ⏳ Definir `NEXT_PUBLIC_COD_SHIPPING_FEE` y el proceso de confirmación por WhatsApp antes de despachar.

## Seguridad
- ✅ Headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- ✅ Verificación de origen y rate limit en `/api/checkout` y `/api/cod`.
- ✅ CI (typecheck, build, `npm audit`) y Dependabot.
- ⏳ 2FA en GitHub, Shopify, Dropi, Meta y Vercel.
- ⬜ Rate limit compartido (Vercel Firewall o KV) si crece el tráfico.

## Infraestructura y SEO
- ✅ Sitemap, robots (no indexa con el checkout apagado), datos estructurados, imagen OG, FAQ.
- ⏳ Dominio en Vercel y `NEXT_PUBLIC_SITE_URL=https://luzunido.co`.
- ⏳ Google Search Console: verificar dominio y enviar el sitemap.
- ⬜ Webhook de Shopify para revalidar precio y stock al instante (hoy cada 5 min).
- ⬜ Monitoreo de errores (Sentry o similar) y analítica con consentimiento.

## Agentes de mantenimiento (`.claude/agents/`)
- ✅ `redes-meta`, `arquitecto`, `dropshipping`, `frontend-seo-ux`, `backend-seguridad`.
- ⏳ Rutina de redes cada 8-12 h: necesita una app de Meta con `pages_manage_posts`, `instagram_content_publish`
  y `ads_management`, un token de System User guardado como secreto (`META_SYSTEM_USER_TOKEN`), el tope
  `META_DAILY_BUDGET_COP` y acceso de red a graph.facebook.com. Los anuncios se crean en pausa.
