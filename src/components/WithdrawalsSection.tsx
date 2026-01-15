import React, { useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PROJECT_CAPITAL_ABI } from '@/lib/contracts/ProjectCapital';
import { formatEther } from 'viem';
import { Wallet, Download, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Round {
  id: string;
  name: string;
  contract_address: string;
}

interface WithdrawalItemProps {
  round: Round;
  address: `0x${string}`;
}

function WithdrawalItem({ round, address }: WithdrawalItemProps) {
  const { data: balance, refetch } = useReadContract({
    address: round.contract_address as `0x${string}`,
    abi: PROJECT_CAPITAL_ABI,
    functionName: 'pendingWithdrawals',
    args: [address],
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Withdrawal from ${round.name} successful!`);
      refetch();
    }
    if (error) {
      toast.error(`Withdrawal failed: ${error.message}`);
    }
  }, [isSuccess, error, round.name, refetch]);

  if (!balance || balance === 0n) return null;

  return (
    <div className="flex items-center justify-between p-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl group transition-all hover:border-amber-500/30">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0">
            Refund Available
          </Badge>
        </div>
        <span className="text-base font-bold text-slate-900 dark:text-slate-100">{round.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
            {Number(formatEther(balance)).toFixed(4)} ETH
          </span>
        </div>
      </div>
      <Button
        onClick={() => writeContract({
          address: round.contract_address as `0x${string}`,
          abi: PROJECT_CAPITAL_ABI,
          functionName: 'withdraw',
          args: ['0x0000000000000000000000000000000000000000'],
        })}
        disabled={isPending || isConfirming}
        size="lg"
        className="rounded-full px-6 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
      >
        {isPending || isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Withdraw
          </>
        )}
      </Button>
    </div>
  );
}

export default function WithdrawalsSection({ rounds }: { rounds: Round[] }) {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address || rounds.length === 0) return null;

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900/50">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Pending Withdrawals</CardTitle>
            <CardDescription>Available refunds from project rounds</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-6">
        <div className="flex gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg h-fit shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-100">Refunds & Withdrawals</p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/60 leading-relaxed">
              If you were removed from a whitelist or sent more than the cap, your funds are available here for manual withdrawal.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {rounds.map((round) => (
            <WithdrawalItem key={round.id} round={round} address={address} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

