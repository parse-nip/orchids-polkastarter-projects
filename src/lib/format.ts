export function toFiniteNumber(value: unknown): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;
  return Number.isFinite(n) ? n : 0;
}

export function formatTokenAmount(amount: unknown, tokenSymbol?: string): string {
  const n = toFiniteNumber(amount);
  const sym = (tokenSymbol || "").toUpperCase();

  // Default locale formatting rounds small numbers aggressively (often to 3 decimals),
  // which makes small ETH amounts show as "0". We intentionally allow more precision.
  let maximumFractionDigits = 2;
  if (["ETH", "BNB", "POL", "MATIC", "ARB"].includes(sym)) maximumFractionDigits = 6;
  if (Math.abs(n) > 0 && Math.abs(n) < 1) maximumFractionDigits = Math.max(maximumFractionDigits, 6);

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(n);
}


