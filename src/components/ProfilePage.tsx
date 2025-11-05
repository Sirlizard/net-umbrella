import React, { useEffect, useRef, useState } from 'react';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';
import { DatabaseFriend } from '../hooks/useFriends';
import { User, BarChart2, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  profile: UserProfile | null;
  friends: DatabaseFriend[];
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, friends, onBack }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { updateProfile } = useUserProfile()
  const [nameInput, setNameInput] = useState(profile?.full_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  // Keep local input synced when upstream profile changes
  useEffect(() => {
    setNameInput(profile?.full_name ?? '')
  }, [profile?.full_name])

  const handlePickFile = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setError(null)
    setUploading(true)
    try {
      // Ensure path starts with auth UID to satisfy storage RLS
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user) throw userErr || new Error('Not authenticated')
      const uid = userRes.user.id

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `avatar_${Date.now()}.${ext}`
      const path = `${uid}/${fileName}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type })
      if (upErr) throw upErr

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = pub?.publicUrl
      if (!publicUrl) throw new Error('Failed to resolve public URL')

      await updateProfile({ avatar_url: publicUrl })
    } catch (err) {
      console.error('Avatar upload failed', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      // reset input so same file change can trigger again
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveName = async () => {
    if (!nameInput || !nameInput.trim()) {
      setError('Please enter a valid name')
      return
    }
    setError(null)
    setSavingName(true)
    try {
      const { error } = await updateProfile({ full_name: nameInput.trim() }) as any
      if (error) throw new Error(error)
      // Optimistic UX: collapse editor on success
      setEditingName(false)
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2500)
    } catch (err) {
      console.error('Failed to save name', err)
      setError(err instanceof Error ? err.message : 'Failed to save name')
    } finally {
      setSavingName(false)
    }
  }

  // Always render profile controls even if there are no connections yet
  const hasFriends = !!friends && friends.length > 0;
  const mostMessagedFriend = hasFriends
    ? friends.reduce((prev, current) => {
        const prevTotal = prev.messages_sent_count + prev.messages_received_count;
        const currentTotal = current.messages_sent_count + current.messages_received_count;
        return prevTotal > currentTotal ? prev : current;
      }, friends[0])
    : null;

  const totalMessages = hasFriends
    ? friends.reduce((sum, f) => sum + f.messages_sent_count + f.messages_received_count, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue">My Profile</h2>
          <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-100 text-[#28428c] rounded-lg hover:bg-gray-200 transition-colors duration-200">
            Back to Dashboard
          </button>
        </div>
        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}
        <div className="flex items-center space-x-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border" />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            {/* Name display + inline editor */}
            {!editingName ? (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-blue">
                  {profile?.full_name && profile.full_name.trim() ? profile.full_name : 'Your Name'}
                </h3>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent text-blue"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-3 py-2 text-sm bg-blue text-white rounded-lg hover:bg-blue-dark disabled:opacity-60"
                >
                  {savingName ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setNameInput(profile?.full_name ?? '')
                    setEditingName(false)
                  }}
                  disabled={savingName}
                  className="px-3 py-2 text-sm bg-gray-100 text-blue rounded-lg hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handlePickFile}
                disabled={uploading}
                className="px-3 py-1.5 text-sm bg-blue text-white rounded-lg hover:bg-blue-dark disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : (profile?.avatar_url ? 'Change Photo' : 'Add Photo')}
              </button>
              <button
                onClick={() => {
                  if (editingName) {
                    setNameInput(profile?.full_name ?? '')
                    setEditingName(false)
                  } else {
                    setEditingName(true)
                  }
                }}
                disabled={savingName}
                className="px-3 py-1.5 text-sm bg-gray-100 text-blue rounded-lg hover:bg-gray-200 disabled:opacity-60"
              >
                {editingName ? 'Cancel' : 'Change Name'}
              </button>
              {nameSaved && (
                <span className="text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-md px-2 py-1">
                  Name saved
                </span>
              )}
              <input
                ref={fileInputRef}
                onChange={handleFileChange}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-blue mb-4">Your Analytics</h3>
        {hasFriends ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart2 className="w-6 h-6 text-blue" />
                  <div>
                    <p className="text-sm text-blue">Most Messaged Connection</p>
                    <p className="text-lg font-semibold text-blue">{mostMessagedFriend?.name}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-blue" />
                  <div>
                    <p className="text-sm text-blue">Total Messages</p>
                    <p className="text-lg font-semibold text-blue">{totalMessages.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">More detailed analytics and profile editing coming soon!</p>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">You don't have any connections yet to show analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
};
