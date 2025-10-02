import React, { useMemo, useState } from 'react';
import { Friend, SocialLink } from '../types/Friend';
import { formatLastContacted } from '../utils/timeFormatter';
import { 
  getReceivedMessageCount, 
  getTotalReceivedMessages, 
  getAverageResponseTime, 
  formatResponseTime,
  getLastReceivedMessage,
  getLastSentMessage,
  getSentMessageCount,
  getTotalSentMessages
} from '../utils/messageAnalytics';
import { ArrowLeft, MessageCircle, Send, MessageSquare, Plus, Instagram, Twitter, Facebook, Linkedin, Mail, Phone, MessageCircleMore, Trash2, CreditCard as Edit3, BarChart3, TrendingUp } from 'lucide-react';
import { useSocialLinks } from '../hooks/useSocialLinks'
import { supabase } from '../lib/supabase'

interface FriendDetailViewProps {
  friend: Friend;
  onBack: () => void;
  onUpdateFriend: (updatedFriend: Friend) => void;
}

export const FriendDetailView: React.FC<FriendDetailViewProps> = ({ 
  friend, 
  onBack, 
  onUpdateFriend 
}) => {
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(friend.bio || '');
  const [contactFrequency, setContactFrequency] = useState<number>(friend.contactFrequency ?? 5);

  // Load server-backed social links for this friend
  const { links, addLink, removeLink, recordInteraction, touchLink } = useSocialLinks(friend.id)

  const aggregatedMessageCounts = useMemo(() => {
    // Fallback to local structure if no server links yet
    const totalReceived = getTotalReceivedMessages(friend)
    const totalSent = getTotalSentMessages(friend)
    return { totalReceived, totalSent }
  }, [friend])

  const getPlatformIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className={iconClass} />;
      case 'twitter': return <Twitter className={iconClass} />;
      case 'facebook': return <Facebook className={iconClass} />;
      case 'linkedin': return <Linkedin className={iconClass} />;
      case 'email': return <Mail className={iconClass} />;
      case 'sms': return <Phone className={iconClass} />;
      case 'whatsapp': return <MessageCircle className={iconClass} />;
      case 'discord': return <MessageCircleMore className={iconClass} />;
      default: return <MessageSquare className={iconClass} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'twitter': return 'bg-blue-400';
      case 'facebook': return 'bg-blue-600';
      case 'linkedin': return 'bg-blue-700';
      case 'email': return 'bg-gray-600';
      case 'sms': return 'bg-green-500';
      case 'whatsapp': return 'bg-green-600';
      case 'discord': return 'bg-indigo-600';
      default: return 'bg-[#28428c]';
    }
  };

  const handleMessageAction = async (socialIndex: number, type: 'sent' | 'received') => {
    const now = new Date();
    const updatedFriend = { ...friend };

    // Local optimistic update for in-memory UI
    updatedFriend.socials[socialIndex].messageHistory.push({ type, timestamp: now });
    updatedFriend.socials[socialIndex].lastContacted = now;
    updatedFriend.lastContacted = now;
    onUpdateFriend(updatedFriend);

    // Persist to server via friend_interactions; triggers will update counters/timestamps
    await recordInteraction(friend.id, type === 'sent' ? 'message_sent' : 'message_received', updatedFriend.socials[socialIndex].platform)

    // Best-effort: update social link last_contacted if such column exists
    const matching = links.find(l => l.platform?.toLowerCase() === updatedFriend.socials[socialIndex].platform.toLowerCase() && l.handle === updatedFriend.socials[socialIndex].handle)
    if (matching) {
      await touchLink(matching.id)
    }
  };

  const handleAddPlatform = async () => {
    if (newPlatform.trim() && newHandle.trim()) {
      const platform = newPlatform.trim()
      const handle = newHandle.trim()

      const updatedFriend = { ...friend };
      updatedFriend.socials.push({ platform, handle, lastContacted: undefined, messageHistory: [] });
      onUpdateFriend(updatedFriend);

      await addLink(platform, handle)

      setNewPlatform('');
      setNewHandle('');
      setShowAddPlatform(false);
    }
  };

  const handleRemovePlatform = async (socialIndex: number) => {
    const removed = friend.socials[socialIndex]
    const updatedFriend = { ...friend };
    updatedFriend.socials.splice(socialIndex, 1);
    onUpdateFriend(updatedFriend);

    const match = links.find(l => l.platform?.toLowerCase() === removed.platform.toLowerCase() && l.handle === removed.handle)
    if (match) await removeLink(match.id)
  };

  const handleSaveBio = () => {
    const updatedFriend = { ...friend, bio: editedBio.trim() };
    onUpdateFriend(updatedFriend);
    setIsEditingBio(false);
  };

  const handleSaveContactFrequency = () => {
    const updatedFriend = { ...friend, contactFrequency };
    onUpdateFriend(updatedFriend);
  };

  const getContactStatusColor = (lastContacted?: Date) => {
    if (!lastContacted) return 'text-gray-400';
    
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) return 'text-green-600';
    if (diffDays <= 14) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[#e8e6d8] pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#ffacd6]/20">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-[#ffacd6]/10 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-[#28428c]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#892f1a]">{friend.name}</h1>
              <p className="text-sm text-[#28428c]">
                Last contact: <span className={getContactStatusColor(friend.lastContacted)}>
                  {formatLastContacted(friend.lastContacted)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Bio Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#892f1a]">About</h2>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="p-2 rounded-full hover:bg-[#ffacd6]/10 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4 text-[#28428c]" />
            </button>
          </div>
          
          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Share what makes your friend special and amazing..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveBio}
                  className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingBio(false);
                    setEditedBio(friend.bio || '');
                  }}
                  className="px-4 py-2 bg-gray-200 text-[#28428c] rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[#28428c] leading-relaxed">
                {friend.bio || 'No bio added yet. Click the edit button to add one!'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs text-[#28428c]">
                  <BarChart3 className="w-3 h-3" />
                  <span>{getTotalReceivedMessages(friend)} messages received</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-[#28428c]">
                  <Send className="w-3 h-3" />
                  <span>{getTotalSentMessages(friend)} messages sent</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-[#28428c]">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatResponseTime(getAverageResponseTime(friend.socials.flatMap(s => s.messageHistory)))} response time</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Contact Frequency Preference */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#892f1a]">How often to stay in touch</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#28428c]">Little contact</span>
              <span className="text-sm text-[#28428c]">Frequent contact through the day</span>
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
              <span className="text-sm text-[#28428c]">0</span>
              <span className="text-sm text-[#28428c] font-semibold">Preference: {contactFrequency}/10</span>
              <span className="text-sm text-[#28428c]">10</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveContactFrequency}
                className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
              >
                Save Preference
              </button>
            </div>
          </div>
        </div>

        {/* Contact Platforms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#892f1a]">Contact Platforms</h2>
            <button
              onClick={() => setShowAddPlatform(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Platform</span>
            </button>
          </div>

          {/* Add Platform Form */}
          {showAddPlatform && (
            <div className="bg-[#e8e6d8] rounded-lg p-4 mb-6">
              <h3 className="font-medium text-[#892f1a] mb-3">Add a New Connection! 🌈</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Platform (e.g., Instagram, Discord)"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Handle (e.g., @username, phone number)"
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
                    setShowAddPlatform(false);
                    setNewPlatform('');
                    setNewHandle('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-[#28428c] rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Platform List */}
          <div className="space-y-4">
            {friend.socials.map((social, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4 hover:border-[#ffacd6]/30 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full text-white ${getPlatformColor(social.platform)}`}>
                      {getPlatformIcon(social.platform)}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#892f1a]">{social.platform}</h3>
                      <p className="text-sm text-[#28428c]">{social.handle}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-[#28428c] font-medium">
                          {getReceivedMessageCount(social.messageHistory)} received
                        </span>
                        <span className="text-xs text-[#28428c] font-medium">
                          {getSentMessageCount(social.messageHistory)} sent
                        </span>
                        <span className="text-xs text-[#28428c]">
                          {formatResponseTime(getAverageResponseTime(social.messageHistory))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePlatform(index)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {social.lastContacted && (
                  <p className={`text-xs mb-3 ${getContactStatusColor(social.lastContacted)}`}>
                    Last contact: {formatLastContacted(social.lastContacted)}
                  </p>
                )}
                
                {getLastReceivedMessage(social.messageHistory) && (
                  <p className="text-xs mb-3 text-[#28428c]">
                    Last received: {formatLastContacted(getLastReceivedMessage(social.messageHistory)!)}
                  </p>
                )}
                {getLastSentMessage(social.messageHistory) && (
                  <p className="text-xs mb-3 text-[#28428c]">
                    Last sent: {formatLastContacted(getLastSentMessage(social.messageHistory)!)}
                  </p>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMessageAction(index, 'sent')}
                    className="flex items-center space-x-2 px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Sent Message</span>
                  </button>
                  <button
                    onClick={() => handleMessageAction(index, 'received')}
                    className="flex items-center space-x-2 px-3 py-2 bg-[#ffacd6] text-[#892f1a] rounded-lg hover:bg-[#ff9bc9] transition-colors duration-200 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Received Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {friend.socials.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-[#28428c] mx-auto mb-3 opacity-50" />
              <p className="text-[#28428c] mb-4">Ready to start connecting? Let's add some ways to reach your amazing friend! 🌟</p>
              <button
                onClick={() => setShowAddPlatform(true)}
                className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
              >
                Add Your First Connection! 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};