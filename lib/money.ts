import type { Money } from "@/lib/types";

export function formatMoney(money: Money) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: 0
  }).format(Number(money.amount));
}
