/** Colombian departments with the province codes Shopify uses for addresses in CO (ISO 3166-2). */
export const DEPARTMENTS: Array<{ code: string; name: string }> = [
  { code: "DC", name: "Bogotá D.C." },
  { code: "AMA", name: "Amazonas" },
  { code: "ANT", name: "Antioquia" },
  { code: "ARA", name: "Arauca" },
  { code: "ATL", name: "Atlántico" },
  { code: "BOL", name: "Bolívar" },
  { code: "BOY", name: "Boyacá" },
  { code: "CAL", name: "Caldas" },
  { code: "CAQ", name: "Caquetá" },
  { code: "CAS", name: "Casanare" },
  { code: "CAU", name: "Cauca" },
  { code: "CES", name: "Cesar" },
  { code: "CHO", name: "Chocó" },
  { code: "COR", name: "Córdoba" },
  { code: "CUN", name: "Cundinamarca" },
  { code: "GUA", name: "Guainía" },
  { code: "GUV", name: "Guaviare" },
  { code: "HUI", name: "Huila" },
  { code: "LAG", name: "La Guajira" },
  { code: "MAG", name: "Magdalena" },
  { code: "MET", name: "Meta" },
  { code: "NAR", name: "Nariño" },
  { code: "NSA", name: "Norte de Santander" },
  { code: "PUT", name: "Putumayo" },
  { code: "QUI", name: "Quindío" },
  { code: "RIS", name: "Risaralda" },
  { code: "SAP", name: "San Andrés y Providencia" },
  { code: "SAN", name: "Santander" },
  { code: "SUC", name: "Sucre" },
  { code: "TOL", name: "Tolima" },
  { code: "VAC", name: "Valle del Cauca" },
  { code: "VAU", name: "Vaupés" },
  { code: "VID", name: "Vichada" }
];

/** Colombian mobile numbers: 10 digits starting with 3, optionally written with +57 in front. */
export function normalizeMobile(input: string) {
  const digits = input.replace(/\D/g, "").replace(/^57(?=3\d{9}$)/, "");
  return /^3\d{9}$/.test(digits) ? digits : null;
}
