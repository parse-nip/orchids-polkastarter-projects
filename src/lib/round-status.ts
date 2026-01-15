export type RoundStatusInput = {
  status?: string | null
  end_date?: string | null
  current_amount?: number | string | null
  target_amount?: number | string | null
}

function toNumber(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : 0
  return Number.isFinite(n) ? n : 0
}

export function getRoundDerivedState(input: RoundStatusInput) {
  const status = input.status ?? ""
  const currentAmount = toNumber(input.current_amount)
  const targetAmount = toNumber(input.target_amount)

  // Use a small tolerance (0.01%) for floating point comparison to avoid issues like 0.9999989999 vs 1
  const tolerance = targetAmount * 0.0001
  const isCapReached = targetAmount > 0 && currentAmount >= (targetAmount - tolerance)
  const isExpired = Boolean(input.end_date) ? new Date(input.end_date as string).getTime() < Date.now() : false
  const isCompleted = status === "completed"

  const isClosed = isExpired || isCapReached || isCompleted

  // Display string: keep "upcoming"/etc, but never show Live if closed.
  const displayStatus =
    isClosed ? "Closed Recently" : status === "active" ? "Live" : status || "upcoming"

  return {
    isExpired,
    isCapReached,
    isCompleted,
    isClosed,
    displayStatus,
  }
}


