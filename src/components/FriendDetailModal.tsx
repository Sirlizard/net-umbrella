import React, { useState } from 'react'
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
  const [editedBio, setEditedBio] = useState(friend.bio || '')

  const { links, addLink, removeLink, recordInteraction } = useSocialLinks(friend.id)

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

  const handleMessageAction = async (linkId: string, type: 'message_sent' | 'message_received') => {
    await recordInteraction(friend.id, type)
    // Update last contacted time
    onUpdate(friend.id, { last_contacted: new Date().toISOString() })
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
              <h2 className="text-2xl font-bold text-[#892f1a]">{friend.name}</h2>
              <p className="text-sm text-[#624a4a]">
                Last contact: {formatDate(friend.last_contacted)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-[#624a4a]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Bio Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#892f1a]">About</h3>
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="text-sm text-[#28428c] hover:text-[#1e3366]"
              >
                {isEditingBio ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Share what makes your friend special..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSaveBio}
                  className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-[#624a4a]">
                {friend.bio || 'No bio added yet. Click edit to add one!'}
              </p>
            )}
          </div>

          {/* Contact Frequency */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#892f1a] mb-3">Contact Preference</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-[#624a4a]">
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
                className="w-full accent-[#28428c]"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#624a4a]">0</span>
                <span className="text-sm text-[#28428c] font-semibold">
                  Preference: {contactFrequency}/10
                </span>
                <span className="text-sm text-[#624a4a]">10</span>
              </div>
              <button
                onClick={handleSaveContactFrequency}
                className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
              >
                Save Preference
              </button>
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#892f1a]">Contact Methods</h3>
              <button
                onClick={() => setShowAddPlatform(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Platform</span>
              </button>
            </div>

            {/* Add Platform Form */}
            {showAddPlatform && (
              <div className="bg-[#e8e6d8] rounded-lg p-4 mb-4">
                <h4 className="font-medium text-[#892f1a] mb-3">Add New Platform</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Platform (e.g., Instagram, SMS)"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Handle (e.g., @username, phone)"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddPlatform}
                    className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
                  >
                    Add Platform
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPlatform(false)
                      setNewPlatform('')
                      setNewHandle('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-[#624a4a] rounded-lg hover:bg-gray-300 transition-colors duration-200"
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
                      <h4 className="font-medium text-[#892f1a]">{link.platform}</h4>
                      <p className="text-sm text-[#624a4a]">{link.handle}</p>
                      {link.last_contacted && (
                        <p className="text-xs text-[#624a4a] mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Last contacted: {formatDate(link.last_contacted)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeLink(link.id)}
                      className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMessageAction(link.id, 'message_sent')}
                      className="flex items-center space-x-2 px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Sent Message</span>
                    </button>
                    <button
                      onClick={() => handleMessageAction(link.id, 'message_received')}
                      className="flex items-center space-x-2 px-3 py-2 bg-[#ffacd6] text-[#892f1a] rounded-lg hover:bg-[#ff9bc9] transition-colors duration-200 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Received Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {links.length === 0 && (
              <div className="text-center py-8 text-[#624a4a]">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No contact methods added yet.</p>
                <button
                  onClick={() => setShowAddPlatform(true)}
                  className="mt-2 px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
                >
                  Add First Contact Method
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#892f1a] mb-3">Message Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#28428c]">{friend.messages_sent_count}</div>
                <div className="text-sm text-[#624a4a]">Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#ffacd6]">{friend.messages_received_count}</div>
                <div className="text-sm text-[#624a4a]">Received</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#892f1a]">{friend.total_interactions}</div>
                <div className="text-sm text-[#624a4a]">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}