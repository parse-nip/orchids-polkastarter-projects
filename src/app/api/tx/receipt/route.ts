import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, TransactionReceiptNotFoundError } from "viem";

const RPC_BY_CHAIN_ID: Record<number, string> = {
  // Mainnets
  1: "https://cloudflare-eth.com",
  42161: "https://arb1.arbitrum.io/rpc",
  137: "https://polygon-rpc.com",
  8453: "https://mainnet.base.org",
  56: "https://bsc-dataseed.binance.org",

  // Testnets
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
  421614: "https://sepolia-rollup.arbitrum.io/rpc",
  80002: "https://rpc-amoy.polygon.technology",
  84532: "https://sepolia.base.org",
  97: "https://data-seed-prebsc-1-s1.binance.org:8545",
};

function isHexTx(hash: string) {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

export async function GET(req: NextRequest) {
  try {
    const hash = req.nextUrl.searchParams.get("hash") || "";
    const chainIdRaw = req.nextUrl.searchParams.get("chainId") || "";
    const chainId = Number(chainIdRaw);

    if (!isHexTx(hash)) {
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }
    if (!Number.isFinite(chainId)) {
      return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
    }

    const rpcUrl = RPC_BY_CHAIN_ID[chainId];
    if (!rpcUrl) {
      return NextResponse.json({ error: "Unsupported chainId" }, { status: 400 });
    }

    const client = createPublicClient({
      chain: {
        id: chainId,
        name: `chain-${chainId}`,
        nativeCurrency: { name: "Native", symbol: "NATIVE", decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] } },
      },
      transport: http(rpcUrl),
    });

    try {
      const receipt = await client.getTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      return NextResponse.json(
        { status: receipt.status, blockNumber: receipt.blockNumber?.toString() },
        { status: 200 }
      );
    } catch (err) {
      if (err instanceof TransactionReceiptNotFoundError) {
        return NextResponse.json({ status: "not_found" }, { status: 200 });
      }
      throw err;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}


