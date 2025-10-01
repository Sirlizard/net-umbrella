import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface SocialLinkRow {
  id: string
  friend_id: string
  platform: string
  handle: string
  last_contacted: string | null
}

export const useSocialLinks = (friendId: string | null | undefined) => {
  const [links, setLinks] = useState<SocialLinkRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!friendId) {
      setLinks([])
      return
    }

    const fetchLinks = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
          .from('social_links')
          .select('id, friend_id, platform, handle, last_contacted')
          .eq('friend_id', friendId)
          .order('platform', { ascending: true })

        if (error) throw error
        setLinks(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load social links')
      } finally {
        setLoading(false)
      }
    }

    fetchLinks()

    const channel = supabase
      .channel(`social_links_${friendId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_links', filter: `friend_id=eq.${friendId}` },
        () => fetchLinks()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [friendId])

  const addLink = async (platform: string, handle: string) => {
    if (!friendId) return { data: null, error: 'Missing friend id' }
    const { data, error } = await supabase
      .from('social_links')
      .insert({ friend_id: friendId, platform, handle })
      .select('id, friend_id, platform, handle, last_contacted')
      .single()
    if (!error && data) setLinks(prev => [...prev, data])
    return { data, error }
  }

  const removeLink = async (id: string) => {
    const { error } = await supabase.from('social_links').delete().eq('id', id)
    if (!error) setLinks(prev => prev.filter(l => l.id !== id))
    return { error }
  }

  const recordInteraction = async (
    friend_id: string,
    interaction: 'message_sent' | 'message_received',
    platform?: string
  ) => {
    const { error } = await supabase.from('friend_interactions').insert({
      friend_id,
      interaction_type: interaction,
      platform,
      interaction_date: new Date().toISOString(),
    })

    return { error }
  }

  const touchLink = async (id: string) => {
    // Best-effort update; if the column doesn't exist, ignore the error at call site
    const { data, error } = await supabase
      .from('social_links')
      .update({ last_contacted: new Date().toISOString() })
      .eq('id', id)
      .select('id, friend_id, platform, handle, last_contacted')
      .single()
    if (!error && data) setLinks(prev => prev.map(l => (l.id === id ? data : l)))
    return { error }
  }

  return { links, loading, error, addLink, removeLink, recordInteraction, touchLink }
}


