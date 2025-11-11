import React, { useEffect, useState } from 'react'
import { X, MessageCircle, Send, Plus, Trash2, Clock } from 'lucide-react'
import { useSocialLinks } from '../hooks/useSocialLinks'

interface FriendDetailModalProps {
  friend: any
  onClose: () => void
  onUpdate: (friendId: string, updates: any) => void
}

export const FriendDetailModal: React.FC<FriendDetailModalProps> = ({ friend, onClose, onUpdate }) => {
  const [contactFrequency, setContactFrequency] = useState(friend.contact_frequency || 5)
  const [showAddPlatform, setShowAddPlatform] = useState(false)
  const [newPlatform, setNewPlatform] = useState('')
  const [newHandle, setNewHandle] = useState('')
  const [isEditingBio, setIsEditingBio] = useState(false)
  // Track editing state per link
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editedPlatform, setEditedPlatform] = useState('')
  const [editedHandle, setEditedHandle] = useState('')
  const [editedBio, setEditedBio] = useState(friend.bio || '')
  // Local optimistic stats/state so UI updates immediately without needing refresh
  const [lastContacted, setLastContacted] = useState<string>(friend.last_contacted)
  const [sentCount, setSentCount] = useState<number>(friend.messages_sent_count)
  const [receivedCount, setReceivedCount] = useState<number>(friend.messages_received_count)
  const [totalInteractions, setTotalInteractions] = useState<number>(friend.total_interactions)

  const { links, addLink, removeLink, updateLink, recordInteraction } = useSocialLinks(friend.id)

  // Keep local state in sync if the parent provides updated friend data
  useEffect(() => {
    setLastContacted(friend.last_contacted)
    setSentCount(friend.messages_sent_count)
    setReceivedCount(friend.messages_received_count)
    setTotalInteractions(friend.total_interactions)
  }, [friend])

  const handleSaveContactFrequency = () => {
    onUpdate(friend.id, { contact_frequency: contactFrequency })
  }

  const handleSaveBio = () => {
    onUpdate(friend.id, { bio: editedBio.trim() })
    setIsEditingBio(false)
  }

  const handleAddPlatform = async () => {
    if (newPlatform.trim() && newHandle.trim()) {
      await addLink(newPlatform.trim(), newHandle.trim())
      setNewPlatform('')
      setNewHandle('')
      setShowAddPlatform(false)
    }
  }

  const handleStartEditLink = (link: any) => {
    setEditingLinkId(link.id)
    setEditedPlatform(link.platform || '')
    setEditedHandle(link.handle || '')
  }

  const handleSaveLinkEdit = async (linkId: string) => {
    if (!editedPlatform.trim() || !editedHandle.trim()) return
    await updateLink(linkId, editedPlatform.trim(), editedHandle.trim())
    setEditingLinkId(null)
    setEditedPlatform('')
    setEditedHandle('')
  }

  const handleCancelLinkEdit = () => {
    setEditingLinkId(null)
    setEditedPlatform('')
    setEditedHandle('')
  }

  const handleMessageAction = async (type: 'message_sent' | 'message_received') => {
    const nowIso = new Date().toISOString()

    // Optimistically update local UI state immediately
    setLastContacted(nowIso)
    if (type === 'message_sent') {
      setSentCount((c) => c + 1)
    } else {
      setReceivedCount((c) => c + 1)
    }
    setTotalInteractions((t) => t + 1)

    // Fire-and-forget server update; DB triggers should reconcile counts
    try {
      await recordInteraction(friend.id, type)
    } finally {
      // Best-effort: update friend row so other parts of UI reflect quickly
      const patch: any = { last_contacted: nowIso }
      if (type === 'message_sent') patch.last_message_sent = nowIso
      if (type === 'message_received') patch.last_message_received = nowIso
      // Note: server triggers likely maintain counts; we avoid manual count patch to prevent drift
      onUpdate(friend.id, patch)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-red">{friend.name}</h2>
              <p className="text-sm text-blue">
                Last contact: {formatDate(lastContacted)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-blue" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Bio Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-red">About</h3>
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="text-sm text-blue hover:text-blue-dark"
              >
                {isEditingBio ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Share what makes this connection special..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSaveBio}
                  className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-blue">
                {friend.bio || 'No bio added yet. Click edit to add one!'}
              </p>
            )}
          </div>

          {/* Contact Frequency */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red mb-3">Contact Preference</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-blue">
                <span>Rarely</span>
                <span>Very Often</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={contactFrequency}
                onChange={(e) => setContactFrequency(parseInt(e.target.value, 10))}
                className="w-full accent-blue"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue">0</span>
                <span className="text-sm text-blue font-semibold">
                  Preference: {contactFrequency}/10
                </span>
                <span className="text-sm text-blue">10</span>
              </div>
              <button
                onClick={handleSaveContactFrequency}
                className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors duration-200"
              >
                Save Preference
              </button>
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red">Contact Methods</h3>
              <button
                onClick={() => setShowAddPlatform(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors duration-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Platform</span>
              </button>
            </div>

            {/* Add Platform Form */}
            {showAddPlatform && (
              <div className="bg-cream rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red mb-3">Add New Platform</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Platform (e.g., Instagram, SMS)"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Handle (e.g., @username, phone)"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddPlatform}
                    className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors duration-200"
                  >
                    Add Platform
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPlatform(false)
                      setNewPlatform('')
                      setNewHandle('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-blue rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Platform List */}
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {editingLinkId === link.id ? (
                        <div className="space-y-2">
                          <input className="px-3 py-2 border border-gray-200 rounded-lg w-full mb-1" value={editedPlatform} onChange={e => setEditedPlatform(e.target.value)} />
                          <input className="px-3 py-2 border border-gray-200 rounded-lg w-full" value={editedHandle} onChange={e => setEditedHandle(e.target.value)} />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-medium text-red">{link.platform}</h4>
                          <p className="text-sm text-blue">{link.handle}</p>
                          {link.last_contacted && (
                            <p className="text-xs text-blue mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Last contacted: {formatDate(link.last_contacted)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingLinkId === link.id ? (
                        <>
                          <button onClick={() => handleSaveLinkEdit(link.id)} className="px-3 py-1.5 bg-blue text-white rounded-md">Save</button>
                          <button onClick={handleCancelLinkEdit} className="px-3 py-1.5 bg-gray-100 text-blue rounded-md">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEditLink(link)} className="p-2 rounded-full hover:bg-gray-100 text-blue">
                            Edit
                          </button>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMessageAction('message_sent')}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors duration-200 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Sent Message</span>
                    </button>
                    <button
                      onClick={() => handleMessageAction('message_received')}
                      className="flex items-center space-x-2 px-3 py-2 bg-pink text-red rounded-lg hover:bg-pink-dark transition-colors duration-200 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Received Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {links.length === 0 && (
              <div className="text-center py-8 text-blue">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No contact methods added yet.</p>
                <button
                  onClick={() => setShowAddPlatform(true)}
                  className="mt-2 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors duration-200"
                >
                  Add First Contact Method
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red mb-3">Message Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue">{sentCount}</div>
                <div className="text-sm text-blue">Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink">{receivedCount}</div>
                <div className="text-sm text-blue">Received</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red">{totalInteractions}</div>
                <div className="text-sm text-blue">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}