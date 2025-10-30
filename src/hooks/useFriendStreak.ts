import { useMemo } from 'react'
import { useFriendDailySeries } from './useFriendInteractions'

/**
 * Computes a daily message-sent streak from friend_interactions.
 * Rules:
 * - A day contributes 1 to the streak if there was at least one message SENT that calendar day.
 * - The streak is the count of consecutive days ending either today (if you've messaged today)
 *   OR yesterday (if you haven't messaged yet today but did yesterday). Any gap before that breaks the streak.
 */
export const useFriendStreak = (friendId: string | undefined, lookbackDays: number = 60) => {
  const { data, loading, error } = useFriendDailySeries(friendId, lookbackDays)

  const streak = useMemo(() => {
    if (!data || data.length === 0) return 0

    // Determine the ending index for the streak window:
    // - If today has sent > 0, start at today
    // - Else, if yesterday has sent > 0, start at yesterday
    // - Else, there is no active streak
    const lastIdx = data.length - 1
    const todaySent = (data[lastIdx]?.sent ?? 0) > 0
    let endIdx = lastIdx
    if (!todaySent) {
      endIdx = lastIdx - 1
      if (endIdx < 0 || (data[endIdx]?.sent ?? 0) === 0) return 0
    }

    // Count consecutive days with sent > 0 going backwards from endIdx
    let s = 0
    for (let i = endIdx; i >= 0; i--) {
      const day = data[i]
      if ((day?.sent ?? 0) > 0) s += 1
      else break
    }
    return s
  }, [data])

  return { streak, loading, error }
}
