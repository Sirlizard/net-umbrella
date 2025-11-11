import React, { useEffect, useState } from 'react'
import { useJournals } from '../hooks/useJournals'
import { useFriends } from '../hooks/useFriends'

interface JournalPageProps {
  onBack: () => void
}

export const JournalPage: React.FC<JournalPageProps> = ({ onBack: _onBack }) => {
  const { journals, createJournal, addEntry, listEntries, deleteEntry, deleteJournal } = useJournals()
  const { friends } = useFriends()

  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null)
  const [newJournalTitle, setNewJournalTitle] = useState('My Connections Journal')
  const [entryTitle, setEntryTitle] = useState('')
  const [entryText, setEntryText] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [filterFriendIds, setFilterFriendIds] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showDeleteJournalConfirm, setShowDeleteJournalConfirm] = useState<string | null>(null)

  // Require explicit journal selection to make journaling flow linear.
  // Previously the first journal was auto-selected; that made the flow less deliberate.

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
    const { error } = await addEntry(selectedJournalId, entryTitle.trim(), entryText.trim(), selectedFriendIds)
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
  <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue">Connections Journal</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue mb-3">Your Journals</h2>
              <div className="space-y-2">
                {journals.map(j => (
                  <div key={j.id} className={`border rounded-lg ${selectedJournalId === j.id ? 'border-blue bg-pink/10' : 'border-gray-200'}`}>
                    <button onClick={() => setSelectedJournalId(j.id)} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg">
                      <div className="text-sm text-blue font-medium">{j.title}</div>
                      <div className="text-xs text-blue">Updated {new Date(j.updated_at).toLocaleString()}</div>
                    </button>
                    {selectedJournalId === j.id && (
                      <div className="px-3 pb-2">
                        <button
                          onClick={() => setShowDeleteJournalConfirm(j.id)}
                          className="text-xs px-3 py-1.5 rounded-md border border-blue/30 text-blue hover:bg-blue/10 hover:border-blue/40 transition-colors duration-200"
                          title="Delete this journal and all its entries"
                          aria-label="Delete this journal"
                        >
                          Delete Journal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <input value={newJournalTitle} onChange={e => setNewJournalTitle(e.target.value)} placeholder="New journal title" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent" />
                <button onClick={handleCreateJournal} className="px-3 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark">Create</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-blue mb-3">Tag Connections</h2>
              <div className="text-xs text-[#28428c] mb-2">Tagging attaches selected connections to the entry when you save it.</div>
              <div className="flex flex-wrap gap-2 max-h-80 overflow-auto pr-1">
                {friends.map(f => {
                  const isTagged = selectedFriendIds.includes(f.id)
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFriend(f.id)}
                      disabled={!selectedJournalId}
                      className={`px-3 py-1 text-sm rounded-full transition ${isTagged ? 'bg-pink text-white border-pink' : 'bg-gray-100 text-[#28428c] border border-gray-200'} ${!selectedJournalId ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={isTagged ? 'Tagged for this entry' : 'Tag this connection in the entry'}
                    >
                      {f.name}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-[#28428c] mb-2">Filter Entries</h3>
                <div className="text-xs text-[#28428c] mb-2">Filtering only affects the list of shown entries (it does not change tags on new entries).</div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
                  {friends.map(f => {
                    const isFiltered = filterFriendIds.includes(f.id)
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFilterFriend(f.id)}
                        className={`px-3 py-1 text-sm rounded-full transition border ${isFiltered ? 'bg-blue text-white border-blue' : 'bg-white text-[#28428c] border-gray-200'}`}
                        title={isFiltered ? 'Filter active' : 'Filter entries by this connection'}
                      >
                        {f.name}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2">
                  {filterFriendIds.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue hover:text-blue-dark underline"
                    >
                      Clear filters ({filterFriendIds.length} active)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue mb-3">Write Entry</h2>
              {!selectedJournalId && (
                <div className="mb-4 p-4 bg-cream rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-[#28428c]">Select a journal to begin</div>
                  <div className="text-xs text-[#28428c]">Pick a journal from the left or create a new one. You must choose a journal before writing pages.</div>
                </div>
              )}

              <input
                value={entryTitle}
                onChange={e => setEntryTitle(e.target.value)}
                placeholder="Entry title..."
                disabled={!selectedJournalId}
                className={`w-full px-3 py-2 mb-3 border rounded-lg focus:ring-2 focus:border-transparent ${selectedJournalId ? 'border-gray-200 focus:ring-pink' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`}
              />
              <textarea value={entryText} onChange={e => setEntryText(e.target.value)} placeholder="Capture your thoughts about your connections..." rows={6} disabled={!selectedJournalId} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${selectedJournalId ? 'border-gray-200 focus:ring-pink' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`} />
              <div className="flex justify-end mt-3">
                <button onClick={handleAddEntry} disabled={!selectedJournalId} className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${selectedJournalId ? 'bg-blue hover:bg-blue-dark' : 'bg-gray-300 cursor-not-allowed'}`}>Save Entry</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-blue">Recent Entries</h2>
                {selectedJournalId && (
                  <button
                    onClick={() => setShowDeleteJournalConfirm(selectedJournalId)}
                    className="text-xs px-3 py-1.5 rounded-md border border-blue/30 text-blue hover:bg-blue/10 hover:border-blue/40"
                    title="Delete this journal and all its entries"
                  >
                    Delete Journal
                  </button>
                )}
              </div>
              {filterFriendIds.length > 0 && (
                <div className="mb-3 p-2 bg-cream rounded-lg">
                  <div className="text-xs text-blue">
                    Filtered by: {filterFriendIds.map(id => friends.find(f => f.id === id)?.name).filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
              {entries.length === 0 ? (
                <p className="text-sm text-blue">
                  {filterFriendIds.length > 0 ? 'No entries found with the selected tags.' : 'No entries yet. Your reflections will appear here.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {entries.map(e => (
                    <div key={e.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-blue mb-1">{e.title}</div>
                          <div className="text-xs text-blue">{new Date(e.created_at).toLocaleString()}</div>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(e.id)}
                          className="shrink-0 text-xs px-3 py-1.5 rounded-md border border-blue/30 text-blue hover:bg-blue/10 hover:border-blue/40 transition-colors duration-200"
                          title="Delete this entry"
                          aria-label="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap text-blue">{e.content}</div>
                      {e.journal_entry_friends && e.journal_entry_friends.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-blue mb-1">Tagged connections:</div>
                          <div className="flex flex-wrap gap-1">
                            {e.journal_entry_friends.map((jef: any) => (
                              <span key={jef.friend_id} className="inline-block px-2 py-1 bg-pink/20 text-xs text-blue rounded-full">
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
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-[#28428c] mb-2">Delete Entry</h3>
            <p className="text-sm text-[#28428c] mb-4">Are you sure you want to delete this journal entry? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteEntry(showDeleteConfirm!)}
                className="flex-1 inline-flex items-center justify-center bg-[#28428c] text-white font-semibold py-2 rounded-lg border border-[#1e3366] shadow-sm hover:bg-[#1e3366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28428c]/40 transition-colors duration-200"
                aria-label="Confirm delete entry"
                title="Delete this entry"
              >
                Delete Entry
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 inline-flex items-center justify-center bg-gray-100 text-[#28428c] py-2 rounded-lg border border-gray-300 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Journal Confirmation Modal */}
      {showDeleteJournalConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#28428c] mb-2">Delete Journal</h3>
            <p className="text-sm text-[#28428c] mb-4">Delete this entire journal and all its entries? This cannot be undone.</p>
            <div className="flex space-x-3">
              <button 
                onClick={async () => { await handleDeleteJournal(showDeleteJournalConfirm!); setShowDeleteJournalConfirm(null); }} 
                className="flex-1 bg-[#28428c] text-white font-semibold py-2 rounded-lg border border-[#1e3366] shadow-sm hover:bg-[#1e3366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28428c]/40 transition-colors duration-200"
                aria-label="Confirm delete journal"
                title="Delete this journal"
              >
                Delete Journal
              </button>
              <button 
                onClick={() => setShowDeleteJournalConfirm(null)} 
                className="flex-1 bg-gray-100 text-[#28428c] py-2 rounded-lg border border-gray-300 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


