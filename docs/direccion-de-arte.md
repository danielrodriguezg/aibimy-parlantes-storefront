# Dirección de arte — Parlantes AIBIMY

## Concepto: estudio claro

Los parlantes AIBIMY son tela negra, caucho naranja y paneles de luz RGB. Sobre un fondo claro de
estudio, el parlante negro es lo más oscuro de la página y se vuelve el sujeto. Cada modelo se presenta
de pie dentro de un **arco** de color apagado, con un lazo blanco dibujado a mano encima, esferas
blancas que flotan alrededor y chips con sus cifras. El naranja del caucho marca, a mano, la palabra
que importa.

Lo memorable es una sola cosa: el parlante en su arco. Todo lo demás es callado.

## Paleta

| Token            | Hex       | Uso |
|------------------|-----------|-----|
| `--papel`        | `#F6F7F5` | Fondo de toda la página. |
| `--blanco`       | `#FFFFFF` | Tarjetas, chips, tabla. |
| `--tela`         | `#1C1D21` | Texto principal y botones de acción (pill negro). |
| `--grafito`      | `#5D6068` | Texto secundario. |
| `--niebla`       | `#8B8E97` | Notas, contadores, etiquetas de tabla. |
| `--caucho`       | `#FF6B00` | Logotipo, trazos a mano, badges e íconos de los chips. Nunca como fondo de sección. |
| Arcos            | salvia `#AEBBBB`, pizarra `#B7C2CE`, arena `#D8CCBF`, durazno `#F1D6C2`, liquen `#C9CFC4` | Un tono por modelo (`tone` en `lib/catalog.ts`). |

Un velo cálido arriba a la derecha y uno frío abajo a la izquierda (`.wash`) dan la luz de ventana.

## Tipografía

- **Unbounded** (display): ancha y redondeada como el logotipo de Luzonido. Titulares en minúscula,
  interletrado −0.04 em.
- **Onest** (texto): 17 px / 1.6, líneas de máx. 62 caracteres.
- Sin etiquetas en mayúsculas sostenidas ni cejas sobre cada título.

## Layout

```
Modelos  Comparar           luzonido                        (bolsa)
┌──────────────────┬───────────────────────┬────────────────┐
│ el (sonido)      │        ╭───────╮       │  ←  →  04/05   │
│ también →        │  chip  │ foto  │ chip  │                │
│ se ve. (●)       │        │ arco  │       │  Descripción + │
│ my274bt          │        ╰───────╯       │  Specs       + │
│ $ 260.000        │          (↓)           │  Envío       − │
│ [✓ Agregar] (→)  │                        │                │
└──────────────────┴───────────────────────┴────────────────┘
```

- Tres columnas en escritorio: promesa y compra, el producto, navegación y detalles.
- Tarjetas blancas de radio 32 px para la línea, las features y la tabla; cada producto dentro de su arco.

## Movimiento

- Los trazos a mano se dibujan una vez al cargar.
- Al cambiar de modelo, la foto, los chips y el precio suben y aparecen.
- Las tarjetas de la línea suben con el scroll (scrub).
- `prefers-reduced-motion`: sin Lenis, sin scrub, trazos ya dibujados.

## Copy

- Español de Colombia, tuteo, frases cortas, verbos simples.
- Solo cifras confirmadas en Shopify. Lo "no confirmado" aparece como `—` en la comparación.
- Botones que dicen lo que pasa: "Agregar al carrito", "Ir a pagar", "Elegir mi parlante".
- No se usan notificaciones de compras o likes de otras personas: serían testimonios inventados.
