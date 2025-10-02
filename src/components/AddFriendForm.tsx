import React, { useState } from 'react';
import { Friend, SocialLink, MessageRecord } from '../types/Friend';
import { supabase } from '../lib/supabase'
import { 
  X, 
  Plus, 
  Trash2,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MessageCircle,
  MessageCircleMore,
  MessageSquare,
  User
} from 'lucide-react';

interface AddFriendFormProps {
  onClose: () => void;
  onAddFriend: (friend: Friend) => void;
}

interface ContactMethod {
  platform: string;
  handle: string;
  lastSentMessage?: Date;
  lastReceivedMessage?: Date;
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({ onClose, onAddFriend }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([
    { platform: '', handle: '' }
  ]);

  const getPlatformIcon = (platform: string) => {
    const iconClass = "w-4 h-4";
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

  const addContactMethod = () => {
    setContactMethods([...contactMethods, { platform: '', handle: '' }]);
  };

  const removeContactMethod = (index: number) => {
    if (contactMethods.length > 1) {
      setContactMethods(contactMethods.filter((_, i) => i !== index));
    }
  };

  const updateContactMethod = (index: number, field: keyof ContactMethod, value: string | Date) => {
    const updated = [...contactMethods];
    if (field === 'lastSentMessage' || field === 'lastReceivedMessage') {
      updated[index][field] = value as Date;
    } else {
      updated[index][field] = value as string;
    }
    setContactMethods(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a name for your friend!');
      return;
    }

    const validContactMethods = contactMethods.filter(
      method => method.platform.trim() && method.handle.trim()
    );

    if (validContactMethods.length === 0) {
      alert('Please add at least one contact method!');
      return;
    }

    // Convert contact methods to SocialLink format
    const socials: SocialLink[] = validContactMethods.map(method => {
      const messageHistory: MessageRecord[] = [];
      
      // Add sent message if provided
      if (method.lastSentMessage) {
        messageHistory.push({
          type: 'sent',
          timestamp: method.lastSentMessage
        });
      }
      
      // Add received message if provided
      if (method.lastReceivedMessage) {
        messageHistory.push({
          type: 'received',
          timestamp: method.lastReceivedMessage
        });
      }

      // Sort messages by timestamp
      messageHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return {
        platform: method.platform.trim(),
        handle: method.handle.trim(),
        lastContacted: method.lastSentMessage || method.lastReceivedMessage,
        messageHistory
      };
    });

    // Find the most recent contact date
    const lastContacted = socials.reduce((latest, social) => {
      if (!social.lastContacted) return latest;
      if (!latest) return social.lastContacted;
      return social.lastContacted > latest ? social.lastContacted : latest;
    }, undefined as Date | undefined) || new Date();

    // Create friend in DB
    const { data: createdFriend, error: friendErr } = await supabase
      .from('friends')
      .insert({
        user_id: user?.id,
        name: name.trim(),
        bio: bio.trim() || null,
        contact_frequency: 5,
        last_contacted: lastContacted.toISOString()
      })
      .select('*')
      .single()

    if (friendErr || !createdFriend) {
      alert(friendErr?.message || 'Failed to create friend')
      return
    }

    // Insert social links
    if (socials.length) {
      const socialRows = socials.map(s => ({ friend_id: createdFriend.id, platform: s.platform, handle: s.handle, last_contacted: s.lastContacted ? s.lastContacted.toISOString() : null }))
      const { error: socialErr } = await supabase.from('social_links').insert(socialRows)
      if (socialErr) {
        alert(socialErr.message)
      }
    }

    // Record initial interactions (optional)
    for (const s of socials) {
      for (const m of s.messageHistory) {
        await supabase.from('friend_interactions').insert({
          friend_id: createdFriend.id,
          interaction_type: m.type === 'sent' ? 'message_sent' : 'message_received',
          platform: s.platform,
          interaction_date: m.timestamp.toISOString()
        })
      }
    }

    onAddFriend({ id: createdFriend.id, name: createdFriend.name, bio: createdFriend.bio ?? undefined, socials, lastContacted })
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#28428c] rounded-full">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#892f1a]">Add New Friend! 🌟</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-[#624a4a]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-[#892f1a] mb-2">
              Friend's Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your amazing friend's name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent"
              required
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-[#892f1a] mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what makes this friend special and amazing..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Contact Methods */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-[#892f1a]">
                Contact Methods *
              </label>
              <button
                type="button"
                onClick={addContactMethod}
                className="flex items-center space-x-2 px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Method</span>
              </button>
            </div>

            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-[#e8e6d8]/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {method.platform && getPlatformIcon(method.platform)}
                      <span className="text-sm font-medium text-[#892f1a]">
                        Contact Method {index + 1}
                      </span>
                    </div>
                    {contactMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContactMethod(index)}
                        className="p-1 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Platform (e.g., Instagram, SMS)"
                      value={method.platform}
                      onChange={(e) => updateContactMethod(index, 'platform', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Handle (e.g., @username, phone)"
                      value={method.handle}
                      onChange={(e) => updateContactMethod(index, 'handle', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#624a4a] mb-1">
                        Last Sent Message (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={method.lastSentMessage ? method.lastSentMessage.toISOString().slice(0, 16) : ''}
                        onChange={(e) => updateContactMethod(index, 'lastSentMessage', e.target.value ? new Date(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#624a4a] mb-1">
                        Last Received Message (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={method.lastReceivedMessage ? method.lastReceivedMessage.toISOString().slice(0, 16) : ''}
                        onChange={(e) => updateContactMethod(index, 'lastReceivedMessage', e.target.value ? new Date(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-[#28428c] text-white py-3 rounded-lg hover:bg-[#1e3366] transition-colors duration-200 font-medium"
            >
              Add Amazing Friend! 🚀
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-[#624a4a] rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};