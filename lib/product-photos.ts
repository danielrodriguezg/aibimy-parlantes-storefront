/**
 * Background-free product photos in public/products/<handle>/<view>.webp.
 *
 * They are the store's own Shopify photos, cut out with rembg (isnet-general-use; BiRefNet for the
 * MY268BT pair and the MY362BT back), trimmed to the product with a 2 % margin and saved as WebP
 * with transparency, at most 1400 px.
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
    "front-34": photo(MY262, "front-34", 1186, 1031),
    back: photo(MY262, "back", 1064, 1168)
  },
  [MY264]: {
    "front-34": photo(MY264, "front-34", 947, 1272),
    front: photo(MY264, "front", 687, 1099),
    top: photo(MY264, "top", 1189, 736)
  },
  [MY268]: {
    "front-34": photo(MY268, "front-34", 788, 1253),
    pair: photo(MY268, "pair", 1280, 1048)
  },
  [MY274]: {
    "front-34": photo(MY274, "front-34", 544, 1141),
    back: photo(MY274, "back", 550, 1136)
  },
  [MY362]: {
    "front-34": photo(MY362, "front-34", 1098, 1022),
    back: photo(MY362, "back", 763, 712)
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
  return photosFor(handle).find((photo) => photo.view !== "front-34" && photo.view !== "pair") ?? null;
}
