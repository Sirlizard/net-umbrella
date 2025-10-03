import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface JournalRow {
  id: string
  profile_user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface JournalEntryRow {
  id: string
  journal_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export const useJournals = () => {
  const [journals, setJournals] = useState<JournalRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJournals = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      setJournals(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJournals()
    const channel = supabase
      .channel('journals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journals' }, fetchJournals)
      .subscribe()
    return () => channel.unsubscribe()
  }, [])

  const createJournal = async (title: string) => {
    // Determine current user profile id
    const { data: profileId, error: idErr } = await supabase.rpc('get_current_user_id')
    if (idErr) return { data: null, error: idErr.message }
    const { data, error } = await supabase
      .from('journals')
      .insert({ title, profile_user_id: profileId as string })
      .select('*')
      .single()
    if (!error && data) setJournals(prev => [data, ...prev])
    return { data, error }
  }

  const addEntry = async (journal_id: string, title: string, content: string, friendIds: string[]) => {
    try {
      // First, insert the journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({ journal_id, title, content })
        .select('*')
        .single()
      
      if (entryError) {
        console.error('Error creating journal entry:', entryError)
        return { data: null, error: entryError.message }
      }

      if (!entry) {
        return { data: null, error: 'Failed to create journal entry' }
      }

      // Then, add friend tags if any were selected
      if (friendIds.length > 0) {
        const friendTags = friendIds.map(friend_id => ({ 
          journal_entry_id: entry.id, 
          friend_id 
        }))
        
        const { error: tagsError } = await supabase
          .from('journal_entry_friends')
          .insert(friendTags)
        
        if (tagsError) {
          console.error('Error adding friend tags:', tagsError)
          // Entry was created but tags failed - still return success
          // but log the error for debugging
        }
      }

      // Update the journal's updated_at timestamp
      const { error: updateError } = await supabase
        .from('journals')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', journal_id)
      
      if (updateError) {
        console.error('Error updating journal timestamp:', updateError)
        // Don't fail the whole operation for this
      }

      // Refresh journals list to update the timestamp in UI
      fetchJournals()
      
      return { data: entry as JournalEntryRow, error: null }
      
    } catch (err) {
      console.error('Unexpected error in addEntry:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to save journal entry' 
      }
    }
  }

  const listEntries = async (journal_id: string, friendFilter?: string[]) => {
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_friends (
          friend_id,
          friends (
            id,
            name
          )
        )
      `)
      .eq('journal_id', journal_id)
      .order('created_at', { ascending: false })

    const { data, error } = await query
    
    if (error) return { data: [], error }
    
    let filteredData = data || []
    
    // Filter by friend tags if specified
    if (friendFilter && friendFilter.length > 0) {
      filteredData = filteredData.filter(entry => {
        const entryFriendIds = entry.journal_entry_friends?.map((jef: any) => jef.friend_id) || []
        return friendFilter.some(friendId => entryFriendIds.includes(friendId))
      })
    }
    
    return { data: filteredData as any[], error: null }
  }

  const deleteEntry = async (entryId: string) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
    return { error }
  }

  const deleteJournal = async (journalId: string) => {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId)
    if (!error) {
      setJournals(prev => prev.filter(j => j.id !== journalId))
    }
    return { error }
  }

  return { 
    journals, 
    loading, 
    error, 
    fetchJournals, 
    createJournal, 
    addEntry, 
    listEntries, 
    deleteEntry, 
    deleteJournal 
  }
}


