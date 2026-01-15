import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className="h-4 w-4 animate-spin text-[#00d1ff]" />
    </div>
  )
}

export { Spinner }
