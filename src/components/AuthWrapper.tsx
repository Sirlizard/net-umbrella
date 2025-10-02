import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { useFriends } from '../hooks/useFriends'
import { LoginPage } from './LoginPage'
import { SignupPage } from './SignupPage'
import { LandingPage } from './LandingPage'
import { FriendCard } from './FriendCard'
import { DashboardHeader } from './DashboardHeader'
import { JournalPage } from './JournalPage'
import { AddFriendButton } from './AddFriendButton'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { AddFriendForm } from './AddFriendForm'
import { FriendDetailModal } from './FriendDetailModal'
import { FriendAnalyticsPage } from './FriendAnalyticsPage'
import { Friend } from '../types/Friend'

export const AuthWrapper: React.FC = () => {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const { friends, loading: friendsLoading, addFriend, updateFriend } = useFriends()
  const [authView, setAuthView] = useState<'landing' | 'signup' | 'login'>('landing')
  const [currentView, setCurrentView] = useState<'dashboard' | 'journal' | 'analytics'>('dashboard')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null)

  const handleAddFriend = async (friendData: { name: string; bio?: string; contact_frequency?: number }) => {
    const { data, error } = await addFriend(friendData)
    if (!error && data) {
      setShowAddFriend(false)
    } else if (error) {
      alert(`Error adding friend: ${error}`)
    }
  }

  const handleUpdateFriend = async (friendId: string, updates: any) => {
    const { error } = await updateFriend(friendId, updates)
    if (error) {
      alert(`Error updating friend: ${error}`)
    }
  }

  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#e8e6d8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28428c] mx-auto mb-4"></div>
          <p className="text-[#28428c]">Loading your friendship network...</p>
        </div>
      </div>
    )
  }

  // Show authentication pages if not logged in
  if (!user) {
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />
    } else if (authView === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
    } else {
      return <LandingPage onGetStarted={() => setAuthView('signup')} onSignIn={() => setAuthView('login')} />
    }
  }

  // Show journal view
  if (currentView === 'journal') {
    return <JournalPage onBack={() => setCurrentView('dashboard')} />
  }

  // Show analytics view  
  if (currentView === 'analytics') {
    return <FriendAnalyticsPage friends={friends} onBack={() => setCurrentView('dashboard')} />
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-[#e8e6d8]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EmailVerificationBanner />
        <DashboardHeader 
          friendCount={friends.length} 
          userProfile={profile} 
          onOpenJournal={() => setCurrentView('journal')}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        
        {friendsLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#28428c] mx-auto mb-4"></div>
            <p className="text-[#28428c]">Loading your friends...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend) => (
                <div 
                  key={friend.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-[#ffacd6] transition-all duration-200"
                  onClick={() => setSelectedFriend(friend)}
                >
                  <h3 className="text-lg font-semibold text-[#892f1a] mb-2">{friend.name}</h3>
                  <p className="text-sm text-[#28428c] mb-2">
                    {friend.messages_sent_count + friend.messages_received_count} total messages
                  </p>
                  <p className="text-sm text-[#28428c]">
                    Last contact: {new Date(friend.last_contacted).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[#28428c] mt-1">
                    Last sent: {friend.last_message_sent ? new Date(friend.last_message_sent).toLocaleString() : '—'}
                  </p>
                  {friend.bio && (
                    <p className="text-sm text-[#28428c] mt-2 line-clamp-2">{friend.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {friends.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto border border-[#ffacd6]/20">
              <h3 className="text-lg font-semibold text-[#892f1a] mb-2">
                Ready to create your amazing friendship network? 🌈
              </h3>
              <p className="text-[#28428c] mb-4">
                Start building beautiful connections that will bring happiness and joy to your life! ✨
              </p>
              <button onClick={() => setShowAddFriend(true)} className="bg-[#28428c] text-white px-6 py-2 rounded-lg hover:bg-[#1e3366] transition-colors duration-200">
                Start Your Friendship Journey! 🚀
              </button>
            </div>
          </div>
        )}

        {friends.length > 0 && (
          <div className="mt-10">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ffacd6]/20 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#892f1a]">Keep growing your network</h3>
                <p className="text-[#28428c] text-sm">Add more friends and set up their connections.</p>
              </div>
              <button onClick={() => setShowAddFriend(true)} className="bg-[#28428c] text-white px-4 py-2 rounded-lg hover:bg-[#1e3366] transition-colors duration-200">
                Add more friends
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddFriend && (
        <AddFriendForm onClose={() => setShowAddFriend(false)} onAddFriend={handleAddFriend} />
      )}

      {selectedFriend && (
        <FriendDetailModal 
          friend={selectedFriend} 
          onClose={() => setSelectedFriend(null)}
          onUpdate={handleUpdateFriend}
        />
      )}
    </div>
  )
}