# Dirección de arte — Parla

Parla es la tienda; AIBIMY es la marca de los parlantes que vende. El nombre y el logo del sitio
son siempre los de Parla, y AIBIMY se nombra solo para decir qué producto es.

## Concepto: clean de estudio

El sitio es una página clara y tranquila donde el parlante es el único objeto con color fuerte.
Cada modelo se presenta como en una vitrina: de pie frente a un **arco** de color apagado, con una
línea blanca dibujada a mano a su alrededor, unas esferas blancas flotando y fichas blancas con
sus cifras. Los trazos naranjas a mano (un óvalo alrededor de una palabra, una flecha) son el
único gesto gráfico y vienen del caucho naranja del producto.

La referencia es una tienda de producto único: titular grande a la izquierda, producto al centro,
selector de modelo y acordeón de detalles a la derecha.

## Paleta

| Token           | Hex       | Uso |
|-----------------|-----------|-----|
| `--papel`       | `#F5F6F3` | Fondo de toda la página. Con un velo de luz verde-amarilla arriba a la derecha (`.daylight`). |
| `--tinta`       | `#111214` | Texto, botón principal (pill negro) y el bloque de envíos. |
| `--gris`        | `#6B6E74` | Texto secundario, títulos cerrados del acordeón. |
| `--caucho`      | `#FF6B00` | Trazos a mano, íconos de las fichas, contador del carrito y el botón del bloque de envíos. |
| Arcos           | por modelo | Tonos apagados en `lib/catalog.ts` (`tone`): pizarra, salvia, arena, niebla. |

## Tipografía

- **Onest** 800 para titulares, interletrado −0.05 em, en frase normal (mayúscula inicial).
- **Onest** 400–600 para texto: 17 px / 1.6, líneas de máx. 62 caracteres.
- **Comfortaa** solo para el logotipo de la tienda, `parla.` (el punto en naranja).

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Modelos  Comparar  Envíos          parla.                 🛍 │
│                                                              │
│ AIBIMY MY274BT              ╭────╮            ←  →   04 / 05  │
│ El (sonido)              ●  │ 🔊 │  [IPX6]                   │
│ que se →          [40 W]    │    │            Descripción  +  │
│ ve. ⚡                       │    │            Especificac. −  │
│ $ 199.900                   ╰────╯             Potencia 40 W  │
│ [✓ Agregar al carrito] (→)    (↓)             Envío y pago +  │
└──────────────────────────────────────────────────────────────┘
El MY274BT, de cerca (4 fichas) · Línea de 5 a escala · Comparar · Llega a tu puerta
```

- En móvil todo se apila: titular y compra, producto, selector y acordeón.
- La ficha de producto usa el mismo esquema con las vistas del producto en lugar de los modelos.

## Movimiento

- Al cargar: los trazos naranjas y la línea blanca se dibujan una vez; las fichas suben.
- El producto, las esferas y las fichas flotan despacio, cada uno a su ritmo.
- Cambiar de modelo o de vista cruza las fotos y el color del arco.
- `prefers-reduced-motion`: sin Lenis, sin flotación, trazos ya dibujados.

## Copy

- Español de Colombia, tuteo, frases cortas, verbos simples.
- Solo cifras confirmadas en Shopify. Lo "anunciado" se dice como tal en la ficha;
  lo "no confirmado" aparece como `—` en la comparación.
- Nada de prueba social inventada ("Fulano acaba de comprar"): las fichas flotantes solo
  muestran datos del producto.
- Botones que dicen lo que pasa: "Agregar al carrito", "Ir a pagar", "Elegir mi parlante".

## Fotos

El producto se muestra con sus fotos reales sin fondo (lo que el cliente recibe), nunca con
réplicas 3D.
