# Dirección de arte — Parlantes AIBIMY

## Concepto: la luz que suena

Los parlantes AIBIMY son tela negra, caucho naranja y paneles de luz RGB. El sitio
toma esa idea literal: **la página es un escenario a oscuras y la única fuente de luz
es el parlante**. El color de su panel RGB tiñe el escenario mientras haces scroll;
cuando llega el momento de comparar y comprar, se "prende la luz del día" y la página
pasa a un fondo claro para leer cifras y precios con calma.

- De noche se escucha (historia del producto, 3D, scroll).
- De día se decide (línea completa, comparación, compra).

Lo memorable es una sola cosa: el parlante en 3D y su luz. Todo lo demás es callado.

## Paleta

| Token            | Hex       | Uso |
|------------------|-----------|-----|
| `--escenario`    | `#000000` | Fondo de las secciones de noche. Negro real, sin tinte. |
| `--tela`         | `#1C1D21` | Superficies sobre el escenario (carrito, barra de compra), tinta del modo día. |
| `--dia`          | `#E8E9ED` | Fondo de las secciones de día (gris frío de estudio, no crema). |
| `--niebla`       | `#8B8E97` | Texto secundario en ambos modos. |
| `--blanco`       | `#F5F6F8` | Texto principal de noche. |
| `--caucho`       | `#FF6B00` | Naranja del caucho y del logotipo. **Solo** acción principal de compra y la marca. |
| Espectro RGB     | —         | Solo como luz emitida por el parlante (3D y su reflejo en el escenario). Nunca como decoración. |

## Tipografía

- **Unbounded** (display): ancha y redondeada como el logotipo `aibimy`. Titulares en
  minúscula, como la marca, interletrado −0.03 em. La forma del texto es parte del diseño:
  los titulares grandes se recortan contra la luz del parlante.
- **Onest** (texto): sans neutra y legible; 17 px / 1.6, líneas de máx. 62 caracteres.
- Escala de cuarta justa (×1.333): 13 · 17 · 23 · 30 · 40 · 53 · 71 · 95, y el titular
  del hero con `clamp()` hasta 160 px.
- Sin etiquetas en mayúsculas sostenidas, sin cejas sobre cada título, sin una sola
  palabra resaltada en otro color.

## Layout

```
NOCHE (lienzo 3D fijo detrás)
┌───────────────────────────────────────────────┐
│ aibimy                          carrito (0)   │
│                                               │
│ el sonido                  ╭──────╮           │
│ también se ve.             │ 3D   │  ← luz    │
│ texto 34ch                 ╰──────╯   tiñe    │
│ [ver los 5 modelos]                   el fondo │
└───────────────────────────────────────────────┘
capítulos fijados (pin): texto a la izquierda, el parlante
gira / se abre / se moja / se empareja a la derecha

DÍA
┌───────────────────────────────────────────────┐
│ la línea completa — los 5 en 3D, a escala real│
│  ▫    ▭    ▯    ◻    ▮   ordenados por tamaño │
│ 15 W  —   20 W 30 W 40 W                       │
├───────────────────────────────────────────────┤
│ tabla comparativa (solo datos confirmados)    │
└───────────────────────────────────────────────┘
```

- Texto alineado a la izquierda siempre; el parlante ocupa el centro-derecha.
- Las secciones de la línea usan la potencia (W) como eje real: es la única secuencia
  que justifica numerar.
- Sin tarjetas redondeadas repetidas: los modelos de la línea son objetos 3D sobre el
  mismo piso, no una cuadrícula de cards.

## Movimiento

- Un solo momento orquestado al cargar: el escenario se enciende desde el panel RGB.
- El resto del movimiento responde al scroll (scrub) o a una acción (abrir carrito,
  cambiar de modelo, encender las luces en la ficha).
- `prefers-reduced-motion`: sin scrub ni Lenis; render fijo de cada modelo.

## Copy

- Español de Colombia, tuteo, frases cortas, verbos simples.
- Solo cifras confirmadas en Shopify. Lo "anunciado" se dice como tal en la ficha;
  lo "no confirmado" aparece como `—` en la comparación.
- Botones que dicen lo que pasa: "Agregar al carrito", "Ir a pagar", "Ver el MY362BT".

## Modelos 3D (híbrido)

Cada modelo es procedural en three.js (tela con mapa de normales tejido, caucho,
paneles RGB emisivos animados). Si existe `public/models/<handle>.glb`, se usa ese
archivo automáticamente en lugar del procedural, sin cambiar código.
