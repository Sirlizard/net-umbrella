import React, { useEffect, useMemo, useState } from 'react'
import { useJournals } from '../hooks/useJournals'
import { useFriends } from '../hooks/useFriends'

interface JournalPageProps {
  onBack: () => void
}

export const JournalPage: React.FC<JournalPageProps> = ({ onBack }) => {
  const { journals, createJournal, addEntry, listEntries } = useJournals()
  const { friends } = useFriends()

  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null)
  const [newJournalTitle, setNewJournalTitle] = useState('My Friendship Journal')
  const [entryText, setEntryText] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    if (journals.length && !selectedJournalId) {
      setSelectedJournalId(journals[0].id)
    }
  }, [journals, selectedJournalId])

  useEffect(() => {
    const load = async () => {
      if (!selectedJournalId) return
      const { data } = await listEntries(selectedJournalId)
      setEntries(data || [])
    }
    load()
  }, [selectedJournalId])

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
    if (!selectedJournalId || !entryText.trim()) return
    const { data, error } = await addEntry(selectedJournalId, entryText.trim(), selectedFriendIds)
    if (!error && data) {
      setEntries(prev => [data, ...prev])
      setEntryText('')
      setSelectedFriendIds([])
    }
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
                  <button key={j.id} onClick={() => setSelectedJournalId(j.id)} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedJournalId === j.id ? 'border-[#28428c] bg-[#ffacd6]/10' : 'border-gray-200 hover:border-[#ffacd6]/50'}`}>
                    <div className="text-sm text-[#892f1a] font-medium">{j.title}</div>
                    <div className="text-xs text-[#624a41]">Updated {new Date(j.updated_at).toLocaleString()}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <input value={newJournalTitle} onChange={e => setNewJournalTitle(e.target.value)} placeholder="New journal title" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent" />
                <button onClick={handleCreateJournal} className="px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366]">Create</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Tag Friends</h2>
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {friends.map(f => (
                  <label key={f.id} className="flex items-center space-x-2 text-sm text-[#624a41]">
                    <input type="checkbox" checked={selectedFriendIds.includes(f.id)} onChange={() => toggleFriend(f.id)} />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Write Entry</h2>
              <textarea value={entryText} onChange={e => setEntryText(e.target.value)} placeholder="Capture your thoughts about your friendships..." rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent" />
              <div className="flex justify-end mt-3">
                <button onClick={handleAddEntry} className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200">Save Entry</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-[#892f1a] mb-3">Recent Entries</h2>
              {entries.length === 0 ? (
                <p className="text-sm text-[#624a41]">No entries yet. Your reflections will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {entries.map(e => (
                    <div key={e.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="text-xs text-[#624a41] mb-2">{new Date(e.created_at).toLocaleString()}</div>
                      <div className="whitespace-pre-wrap text-[#892f1a]">{e.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


