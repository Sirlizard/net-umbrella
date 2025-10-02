import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export const useUserProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single()
          .select('*')
          .eq('auth_id', user.id)
          .single()
          .select('*')
          .eq('auth_id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist yet, create it
            const { data: insertData, error: insertError } = await supabase
              .from('users')
              .insert({
                auth_id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email,
                avatar_url: user.user_metadata?.avatar_url
              })
              .select()
              .single()

            if (insertError) {
              throw insertError
            }

            setProfile(insertData)
          } else {
                  } else {
          setProfile(data)
        }
              } catch (err) {
        console.error('Error fetching user profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
          }
    }

    fetchProfile()
  }, [user])

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update profile' }
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
}