import React, { useState } from 'react';
import { Friend, SocialLink } from '../types/Friend';
import { formatLastContacted } from '../utils/timeFormatter';
import { 
  getReceivedMessageCount, 
  getTotalReceivedMessages, 
  getAverageResponseTime, 
  formatResponseTime,
  getLastReceivedMessage 
} from '../utils/messageAnalytics';
import { 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  MessageSquare, 
  Plus,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MessageCircleMore,
  Trash2,
  Edit3,
  BarChart3,
  TrendingUp
} from 'lucide-react';

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

  const handleMessageAction = (socialIndex: number, type: 'sent' | 'received') => {
    const now = new Date();
    const updatedFriend = { ...friend };
    
    // Add message to history
    updatedFriend.socials[socialIndex].messageHistory.push({
      type,
      timestamp: now
    });
    
    // Update the specific social platform's last contacted time
    updatedFriend.socials[socialIndex].lastContacted = now;
    
    // Update the overall last contacted time
    updatedFriend.lastContacted = now;
    
    onUpdateFriend(updatedFriend);
  };

  const handleAddPlatform = () => {
    if (newPlatform.trim() && newHandle.trim()) {
      const updatedFriend = { ...friend };
      updatedFriend.socials.push({
        platform: newPlatform.trim(),
        handle: newHandle.trim(),
        lastContacted: undefined,
        messageHistory: []
      });
      
      onUpdateFriend(updatedFriend);
      setNewPlatform('');
      setNewHandle('');
      setShowAddPlatform(false);
    }
  };

  const handleRemovePlatform = (socialIndex: number) => {
    const updatedFriend = { ...friend };
    updatedFriend.socials.splice(socialIndex, 1);
    onUpdateFriend(updatedFriend);
  };

  const handleSaveBio = () => {
    const updatedFriend = { ...friend, bio: editedBio.trim() };
    onUpdateFriend(updatedFriend);
    setIsEditingBio(false);
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
              <p className="text-sm text-[#624a4a]">
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
              <Edit3 className="w-4 h-4 text-[#624a4a]" />
            </button>
          </div>
          
          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Add a bio for your friend..."
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
                  className="px-4 py-2 bg-gray-200 text-[#624a4a] rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[#624a4a] leading-relaxed">
                {friend.bio || 'No bio added yet. Click the edit button to add one!'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs text-[#28428c]">
                  <BarChart3 className="w-3 h-3" />
                  <span>{getTotalReceivedMessages(friend)} messages received</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-[#624a4a]">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatResponseTime(getAverageResponseTime(friend.socials.flatMap(s => s.messageHistory)))} response time</span>
                </div>
              </div>
            </>
          )}
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
              <h3 className="font-medium text-[#892f1a] mb-3">Add New Platform</h3>
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
                  className="px-4 py-2 bg-gray-200 text-[#624a4a] rounded-lg hover:bg-gray-300 transition-colors duration-200"
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
                      <p className="text-sm text-[#624a4a]">{social.handle}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-[#28428c] font-medium">
                          {getReceivedMessageCount(social.messageHistory)} received
                        </span>
                        <span className="text-xs text-[#624a4a]">
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
              <MessageSquare className="w-12 h-12 text-[#624a4a] mx-auto mb-3 opacity-50" />
              <p className="text-[#624a4a] mb-4">No contact platforms added yet.</p>
              <button
                onClick={() => setShowAddPlatform(true)}
                className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
              >
                Add Your First Platform
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};