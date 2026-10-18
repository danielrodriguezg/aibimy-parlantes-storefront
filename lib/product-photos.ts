/**
 * Background-free product photos in public/products/<handle>/<view>.webp.
 *
 * They are the store's own Shopify photos, cut out with rembg (isnet-general-use; BiRefNet for the
 * MY268BT pair and the MY362BT back), trimmed to the product with a 2 % margin, then given one
 * shared finish: defringed edges, small sources enlarged to 1400 px (Lanczos + sharpening) and the
 * same shadow lift and contrast for every model. The MY264BT splash shot is left out; its clean
 * front view leads instead.
 */

export type PhotoView = "front-34" | "front" | "back" | "top" | "pair";

export type Photo = { src: string; width: number; height: number };

export type ViewPhoto = Photo & { view: PhotoView; label: string };

const VIEW_ORDER: PhotoView[] = ["front-34", "front", "back", "top", "pair"];

const VIEW_LABEL: Record<PhotoView, string> = {
  "front-34": "Tres cuartos",
  front: "Frente",
  back: "Atrás",
  top: "Arriba",
  pair: "En pareja"
};

const photo = (handle: string, view: PhotoView, width: number, height: number): Photo => ({
  src: `/products/${handle}/${view}.webp`,
  width,
  height
});

const MY262 = "parlante-aibimy-my262bt-pro-bluetooth";
const MY264 = "parlante-aibimy-my264bt-bluetooth-rgb";
const MY268 = "parlante-aibimy-my268bt-bluetooth-20w";
const MY274 = "parlante-aibimy-my274bt-bluetooth-40w";
const MY362 = "parlante-aibimy-my362bt-bluetooth-30w";

export const PHOTOS: Record<string, Partial<Record<PhotoView, Photo>>> = {
  [MY262]: {
    "front-34": photo(MY262, "front-34", 1400, 1217),
    back: photo(MY262, "back", 1275, 1400)
  },
  [MY264]: {
    front: photo(MY264, "front", 875, 1400),
    top: photo(MY264, "top", 1400, 867)
  },
  [MY268]: {
    "front-34": photo(MY268, "front-34", 880, 1400),
    pair: photo(MY268, "pair", 1400, 1146)
  },
  [MY274]: {
    "front-34": photo(MY274, "front-34", 667, 1400),
    back: photo(MY274, "back", 678, 1400)
  },
  [MY362]: {
    "front-34": photo(MY362, "front-34", 1400, 1303),
    back: photo(MY362, "back", 1400, 1306)
  }
};

/** Every cut-out view of a product, in a consistent order (empty for products without cutouts). */
export function photosFor(handle: string): ViewPhoto[] {
  const views = PHOTOS[handle] ?? {};
  return VIEW_ORDER.flatMap((view) => {
    const found = views[view];
    return found ? [{ ...found, view, label: VIEW_LABEL[view] }] : [];
  });
}

/** The main cutout of a product: the three-quarter view, or whatever exists. */
export function heroPhoto(handle: string): ViewPhoto | null {
  return photosFor(handle)[0] ?? null;
}

/** A second angle for hover and turntable effects, if there is one that shows the product alone. */
export function altPhoto(handle: string): ViewPhoto | null {
  const lead = heroPhoto(handle)?.view;
  return photosFor(handle).find((photo) => photo.view !== lead && photo.view !== "pair") ?? null;
}
