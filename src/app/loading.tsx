import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00d1ff] animate-spin" />
        <p className="mt-4 text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}
