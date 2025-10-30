// Map a 0-10 contact frequency slider to a target interval (in days)
// Higher frequency -> shorter target window. We clamp to a sensible range.
// Defaults to 14 days if frequency is missing.
export function frequencyToTargetDays(freq?: number): number {
  if (typeof freq !== 'number' || Number.isNaN(freq)) return 14;
  const clamped = Math.min(10, Math.max(0, Math.round(freq)));
  // 28 days at 0 (rare contact) down to 4 days at 10 (frequent contact)
  const days = Math.round(28 - clamped * 2.4);
  return Math.max(3, days);
}
