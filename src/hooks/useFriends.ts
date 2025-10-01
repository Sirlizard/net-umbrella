import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface DatabaseFriend {
  id: string
  profile_user_id: string
  name: string
  bio: string | null
  last_contacted: string
  contact_frequency: number | null
  messages_sent_count: number
  messages_received_count: number
  last_message_sent: string | null
  last_message_received: string | null
  total_interactions: number
  created_at: string
  updated_at: string
}

export const useFriends = () => {
  const { user } = useAuth()
  const [friends, setFriends] = useState<DatabaseFriend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setFriends([])
      setLoading(false)
      return
    }

    const fetchFriends = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('friends')
          .select('*')
          .order('last_contacted', { ascending: false })

        if (error) {
          throw error
        }

        setFriends(data || [])
      } catch (err) {
        console.error('Error fetching friends:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch friends')
      } finally {
        setLoading(false)
      }
    }

    fetchFriends()

    // Set up real-time subscription
    const subscription = supabase
      .channel('friends_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends'
        },
        () => {
          fetchFriends()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const addFriend = async (friendData: {
    name: string
    bio?: string
    contact_frequency?: number
  }) => {
    try {
      // Resolve the current user's profile id to satisfy RLS and FK on friends.profile_user_id
      const { data: currentProfileId, error: currentIdError } = await supabase
        .rpc('get_current_user_id')

      if (currentIdError) {
        throw currentIdError
      }

      if (!currentProfileId) {
        throw new Error('Could not resolve current profile id')
      }

      const { data, error } = await supabase
        .from('friends')
        .insert({
          name: friendData.name,
          bio: friendData.bio,
          contact_frequency: friendData.contact_frequency || 5,
          last_contacted: new Date().toISOString(),
          // Link to the owning user profile for RLS and relationships
          profile_user_id: currentProfileId as string
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setFriends(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error adding friend:', err)
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add friend' }
    }
  }

  const updateFriend = async (friendId: string, updates: Partial<DatabaseFriend>) => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .update(updates)
        .eq('id', friendId)
        .select()
        .single()

      if (error) {
        throw error
      }

      setFriends(prev => prev.map(friend => 
        friend.id === friendId ? data : friend
      ))
      return { data, error: null }
    } catch (err) {
      console.error('Error updating friend:', err)
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update friend' }
    }
  }

  const deleteFriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendId)

      if (error) {
        throw error
      }

      setFriends(prev => prev.filter(friend => friend.id !== friendId))
      return { error: null }
    } catch (err) {
      console.error('Error deleting friend:', err)
      return { error: err instanceof Error ? err.message : 'Failed to delete friend' }
    }
  }

  return {
    friends,
    loading,
    error,
    addFriend,
    updateFriend,
    deleteFriend
  }
}