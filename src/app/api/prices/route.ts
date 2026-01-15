import { NextRequest, NextResponse } from "next/server";

// Very small in-memory cache (per server instance)
let cache: { at: number; data: Record<string, number> } | null = null;

const STABLES = new Set(["USDC", "USDT"]);

// CoinGecko IDs for our supported symbols.
// Note: Polygon token has migrated naming over time; we try multiple IDs.
const COINGECKO_IDS: Record<string, string[]> = {
  ETH: ["ethereum"],
  BNB: ["binancecoin"],
  POL: ["polygon-ecosystem-token", "matic-network"],
};

async function fetchCoingecko(ids: string[]) {
  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("vs_currencies", "usd");

  const res = await fetch(url.toString(), {
    // Keep it snappy
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  return (await res.json()) as Record<string, { usd?: number }>;
}

export async function GET(req: NextRequest) {
  try {
    const symbolsParam = req.nextUrl.searchParams.get("symbols") || "";
    const symbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const unique = Array.from(new Set(symbols));
    if (unique.length === 0) {
      return NextResponse.json({ prices: {} }, { status: 200 });
    }

    // Cache for 30s to avoid rate limits
    if (cache && Date.now() - cache.at < 30_000) {
      const prices: Record<string, number> = {};
      for (const s of unique) {
        if (STABLES.has(s)) prices[s] = 1;
        else if (cache.data[s] != null) prices[s] = cache.data[s];
      }
      return NextResponse.json({ prices }, { status: 200 });
    }

    const ids: string[] = [];
    const symbolToIds: Record<string, string[]> = {};

    for (const s of unique) {
      if (STABLES.has(s)) continue;
      const sIds = COINGECKO_IDS[s];
      if (!sIds) continue;
      symbolToIds[s] = sIds;
      for (const id of sIds) ids.push(id);
    }

    const cg = ids.length ? await fetchCoingecko(Array.from(new Set(ids))) : {};

    const computed: Record<string, number> = {};
    for (const s of unique) {
      if (STABLES.has(s)) {
        computed[s] = 1;
        continue;
      }
      const candidates = symbolToIds[s] || [];
      const found = candidates
        .map((id) => cg?.[id]?.usd)
        .find((v) => typeof v === "number" && Number.isFinite(v));
      if (typeof found === "number") computed[s] = found;
    }

    cache = { at: Date.now(), data: computed };

    return NextResponse.json({ prices: computed }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch prices" },
      { status: 500 }
    );
  }
}


