import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { supabase } from '../lib/supabase'

interface AddFriendFormProps {
  onClose: () => void;
  onAddFriend: (friendData: { name: string; bio?: string; contact_frequency?: number; avatar_url?: string | null }) => Promise<{ data?: any; error?: any }>;
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({ onClose, onAddFriend }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  // For initial creation we intentionally do NOT ask for contact methods.
  // Contacts can be added later from the connection detail view.

  // No contact method helpers here — contacts are added in the detail view after creation.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a name for your connection!');
      return;
    }

    // First create the friend without the avatar so we have an id to upload into
    const res = await onAddFriend({
      name: name.trim(),
      bio: bio.trim() || undefined,
      contact_frequency: 5,
      avatar_url: undefined
    });

    // If an image was selected, upload it to avatars/<friendId>/ and persist the public URL
    if (selectedFile && res && res.data && res.data.id) {
      try {
        const id = res.data.id
        const path = `avatars/${id}/${Date.now()}-${selectedFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(path, selectedFile, { upsert: true })
        if (uploadError) {
          console.error('Upload error', uploadError)
          throw uploadError
        }
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path)
        const publicUrl = publicData?.publicUrl
        if (!publicUrl) throw new Error('Failed to obtain public URL after upload')
        // Persist the avatar_url on the friend row
        const { data: updated, error: updateError } = await supabase.from('friends').update({ avatar_url: publicUrl }).eq('id', id).select().single()
        if (updateError) {
          console.error('Failed to update friend with avatar_url', updateError)
          throw updateError
        }
        console.log('Uploaded avatar and updated friend:', updated)
      } catch (err) {
        console.error('Avatar upload failed after friend creation', err)
        alert('Failed to upload avatar image after creating friend. You can add one later from the friend detail view.')
      }
    }
  };

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue rounded-full">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-red">Add New Connection! 🌟</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-blue" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-red mb-2">
              Connection's Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the connection's name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
              required
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-red mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what makes this connection special..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Avatar image (optional) */}
          <div>
            <label className="block text-sm font-medium text-red mb-2">Profile Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">You can add an image now or edit it later from the connection detail view.</p>
          </div>

          {/* Contact methods are intentionally omitted from the initial create flow. */}
          <div className="p-3 bg-cream rounded-lg text-sm text-blue">You can add contact methods later from the connection's detail view.</div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-blue text-white py-3 rounded-lg hover:bg-blue-dark transition-colors duration-200 font-medium"
            >
              Add Connection 🚀
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-blue rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};