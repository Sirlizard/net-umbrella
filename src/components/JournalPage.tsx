import React, { useEffect, useMemo, useState } from 'react'
import { useJournals } from '../hooks/useJournals'
import { useFriends } from '../hooks/useFriends'

interface JournalPageProps {
  onBack: () => void
}

export const JournalPage: React.FC<JournalPageProps> = ({ onBack }) => {
  const { journals, createJournal, addEntry, listEntries, deleteEntry, deleteJournal } = useJournals()
  const { friends } = useFriends()

  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null)
  const [newJournalTitle, setNewJournalTitle] = useState('My Friendship Journal')
  const [entryTitle, setEntryTitle] = useState('')
  const [entryText, setEntryText] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [filterFriendIds, setFilterFriendIds] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (journals.length && !selectedJournalId) {
      setSelectedJournalId(journals[0].id)
    }
  }, [journals, selectedJournalId])

  useEffect(() => {
    const load = async () => {
      if (!selectedJournalId) return
      const { data } = await listEntries(selectedJournalId, filterFriendIds.length > 0 ? filterFriendIds : undefined)
      setEntries(data || [])
    }
    load()
  }, [selectedJournalId, filterFriendIds])

  const toggleFriend = (id: string) => {
    setSelectedFriendIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleCreateJournal = async () => {
    if (!newJournalTitle.trim()) return
    const { data } = await createJournal(newJournalTitle.trim())
    if (data) setSelectedJournalId(data.id)
    setNewJournalTitle('')
  }

  const handleAddEntry = async () => {
    if (!selectedJournalId || !entryText.trim() || !entryTitle.trim()) return
    const { data, error } = await addEntry(selectedJournalId, entryTitle.trim(), entryText.trim(), selectedFriendIds)
    if (!error) {
      // Reload entries to get the full data with friend information
      const { data: updatedEntries } = await listEntries(selectedJournalId, filterFriendIds.length > 0 ? filterFriendIds : undefined)
      setEntries(updatedEntries || [])
      setEntryTitle('')
      setEntryText('')
      setSelectedFriendIds([])
    }
    if (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry. Please try again.')
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    const { error } = await deleteEntry(entryId)
    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== entryId))
    }
    setShowDeleteConfirm(null)
  }

  const handleDeleteJournal = async (journalId: string) => {
    const { error } = await deleteJournal(journalId)
    if (!error && selectedJournalId === journalId) {
      setSelectedJournalId(journals.length > 1 ? journals.find(j => j.id !== journalId)?.id || null : null)
    }
  }

  const toggleFilterFriend = (id: string) => {
    setFilterFriendIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const clearFilters = () => {
    setFilterFriendIds([])
  }

  return (
    <div className="min-h-screen bg-[#e8e6d8]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#892f1a]">Friendship Journal</h1>
          <button onClick={onBack} className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200">Back to Dashboard</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Your Journals</h2>
              <div className="space-y-2">
                {journals.map(j => (
                  <div key={j.id} className={`border rounded-lg ${selectedJournalId === j.id ? 'border-[#28428c] bg-[#ffacd6]/10' : 'border-gray-200'}`}>
                    <button onClick={() => setSelectedJournalId(j.id)} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg">
                      <div className="text-sm text-[#892f1a] font-medium">{j.title}</div>
                      <div className="text-xs text-[#28428c]">Updated {new Date(j.updated_at).toLocaleString()}</div>
                    </button>
                    {selectedJournalId === j.id && (
                      <div className="px-3 pb-2">
                        <button
                          onClick={() => handleDeleteJournal(j.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete Journal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <input value={newJournalTitle} onChange={e => setNewJournalTitle(e.target.value)} placeholder="New journal title" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent" />
                <button onClick={handleCreateJournal} className="px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366]">Create</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Tag Friends</h2>
              <div className="text-xs text-[#28428c] mb-2">Select friends to tag in your entry:</div>
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {friends.map(f => (
                  <label key={f.id} className="flex items-center space-x-2 text-sm text-[#28428c]">
                    <input type="checkbox" checked={selectedFriendIds.includes(f.id)} onChange={() => toggleFriend(f.id)} />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-[#892f1a] mb-2">Filter Entries</h3>
                <div className="text-xs text-[#28428c] mb-2">Show only entries tagged with:</div>
                <div className="space-y-2 max-h-40 overflow-auto pr-1">
                  {friends.map(f => (
                    <label key={f.id} className="flex items-center space-x-2 text-sm text-[#28428c]">
                      <input type="checkbox" checked={filterFriendIds.includes(f.id)} onChange={() => toggleFilterFriend(f.id)} />
                      <span>{f.name}</span>
                    </label>
                  ))}
                </div>
                {filterFriendIds.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-xs text-[#28428c] hover:text-[#1e3366] underline"
                  >
                    Clear filters ({filterFriendIds.length} active)
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Write Entry</h2>
              <input
                value={entryTitle}
                onChange={e => setEntryTitle(e.target.value)}
                placeholder="Entry title..."
                className="w-full px-3 py-2 mb-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent"
              />
              <textarea value={entryText} onChange={e => setEntryText(e.target.value)} placeholder="Capture your thoughts about your friendships..." rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent" />
              <div className="flex justify-end mt-3">
                <button onClick={handleAddEntry} className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200">Save Entry</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Recent Entries</h2>
              {filterFriendIds.length > 0 && (
                <div className="mb-3 p-2 bg-[#e8e6d8] rounded-lg">
                  <div className="text-xs text-[#28428c]">
                    Filtered by: {filterFriendIds.map(id => friends.find(f => f.id === id)?.name).filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
              {entries.length === 0 ? (
                <p className="text-sm text-[#28428c]">
                  {filterFriendIds.length > 0 ? 'No entries found with the selected tags.' : 'No entries yet. Your reflections will appear here.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {entries.map(e => (
                    <div key={e.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-[#892f1a] mb-1">{e.title}</div>
                          <div className="text-xs text-[#28428c]">{new Date(e.created_at).toLocaleString()}</div>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(e.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap text-[#892f1a]">{e.content}</div>
                      {e.journal_entry_friends && e.journal_entry_friends.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-[#28428c] mb-1">Tagged friends:</div>
                          <div className="flex flex-wrap gap-1">
                            {e.journal_entry_friends.map((jef: any) => (
                              <span key={jef.friend_id} className="inline-block px-2 py-1 bg-[#ffacd6]/20 text-xs text-[#892f1a] rounded-full">
                                {jef.friends?.name || 'Unknown'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#892f1a] mb-2">Delete Entry</h3>
            <p className="text-sm text-[#28428c] mb-4">Are you sure you want to delete this journal entry? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => handleDeleteEntry(showDeleteConfirm)} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors duration-200">Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-gray-200 text-[#28428c] py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


