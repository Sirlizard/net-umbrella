import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface DailyInteractionPoint {
  date: Date
  sent: number
  received: number
}

/**
 * Fetches friend_interactions for a friend over the last N days and aggregates by local date.
 * Fills missing days with zeros so charts render continuous series.
 */
export const useFriendDailySeries = (friendId: string | undefined, days: number = 30) => {
  const [data, setData] = useState<DailyInteractionPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!friendId) {
      setData([])
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const now = new Date()
        const start = new Date(now)
        start.setDate(now.getDate() - (days - 1))

        const { data: rows, error } = await supabase
          .from('friend_interactions')
          .select('interaction_date, interaction_type')
          .eq('friend_id', friendId)
          .gte('interaction_date', start.toISOString())
          .lte('interaction_date', now.toISOString())
          .order('interaction_date', { ascending: true })

        if (error) throw error

        // Build map of YYYY-MM-DD -> { sent, received }
        const byDay = new Map<string, { sent: number; received: number }>()
        for (const r of rows || []) {
          const d = new Date(r.interaction_date as string)
          // Use UTC date key to avoid TZ shifts when serializing
          const key = d.toISOString().slice(0, 10)
          const bucket = byDay.get(key) || { sent: 0, received: 0 }
          if (r.interaction_type === 'message_sent') bucket.sent += 1
          else if (r.interaction_type === 'message_received') bucket.received += 1
          byDay.set(key, bucket)
        }

        // Generate contiguous series for last N days
        const series: DailyInteractionPoint[] = []
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now)
          d.setHours(0, 0, 0, 0)
          d.setDate(now.getDate() - i)
          const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
            .toISOString()
            .slice(0, 10)
          const bucket = byDay.get(key) || { sent: 0, received: 0 }
          series.push({ date: d, sent: bucket.sent, received: bucket.received })
        }

        setData(series)
      } catch (err) {
        console.error('Failed to load friend daily series', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Live updates
    const channel = supabase
      .channel(`friend_interactions_${friendId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friend_interactions', filter: `friend_id=eq.${friendId}` },
        () => fetchData()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [friendId, days])

  return { data, loading, error }
}
