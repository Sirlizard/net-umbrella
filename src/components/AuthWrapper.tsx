import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginPage } from './LoginPage'
import { SignupPage } from './SignupPage'
import { Friend } from '../types/Friend'
import { mockFriends } from '../data/mockFriends'
import { FriendCard } from './FriendCard'
import { DashboardHeader } from './DashboardHeader'
import { AddFriendButton } from './AddFriendButton'
import { FriendDetailView } from './FriendDetailView'
import { AddFriendForm } from './AddFriendForm'
import { MessageAnalyticsPage } from './MessageAnalyticsPage'
import { EmailVerificationBanner } from './EmailVerificationBanner'

export const AuthWrapper: React.FC = () => {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showAddFriendForm, setShowAddFriendForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend)
  }

  const handleBackToDashboard = () => {
    setSelectedFriend(null)
  }

  const handleUpdateFriend = (updatedFriend: Friend) => {
    setFriends(prevFriends => 
      prevFriends.map(friend => 
        friend.id === updatedFriend.id ? updatedFriend : friend
      )
    )
    setSelectedFriend(updatedFriend)
  }

  const handleAddFriend = (newFriend: Friend) => {
    setFriends(prevFriends => [...prevFriends, newFriend])
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8e6d8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28428c] mx-auto mb-4"></div>
          <p className="text-[#624a4a]">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication pages if not logged in
  if (!user) {
    if (showSignup) {
      return <SignupPage onSwitchToLogin={() => setShowSignup(false)} />
    }
    return <LoginPage onSwitchToSignup={() => setShowSignup(true)} />
  }

  // Show friend detail view if a friend is selected
  if (selectedFriend) {
    return (
      <FriendDetailView
        friend={selectedFriend}
        onBack={handleBackToDashboard}
        onUpdateFriend={handleUpdateFriend}
      />
    )
  }

  // Show analytics page
  if (showAnalytics) {
    return (
      <div className="min-h-screen bg-[#e8e6d8]">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <DashboardHeader friendCount={friends.length} />
          <MessageAnalyticsPage friends={friends} onBack={() => setShowAnalytics(false)} />
        </div>
      </div>
    )
  }

  // Show add friend form if requested
  if (showAddFriendForm) {
    return (
      <>
        <div className="min-h-screen bg-[#e8e6d8]">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <DashboardHeader friendCount={friends.length} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onClick={handleFriendClick}
                />
              ))}
            </div>
            
            {friends.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto border border-[#ffacd6]/20">
                  <h3 className="text-lg font-semibold text-[#892f1a] mb-2">
                    Ready to create your amazing friendship network? 🌈
                  </h3>
                  <p className="text-[#624a4a] mb-4">
                    Start building beautiful connections that will bring happiness and joy to your life! ✨
                  </p>
                  <button 
                    onClick={() => setShowAddFriendForm(true)}
                    className="bg-[#28428c] text-white px-6 py-2 rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
                  >
                    Start Your Friendship Journey! 🚀
                  </button>
                </div>
              </div>
            )}
            
            <AddFriendButton onClick={() => setShowAddFriendForm(true)} />
          </div>
        </div>
        <AddFriendForm
          onClose={() => setShowAddFriendForm(false)}
          onAddFriend={handleAddFriend}
        />
      </>
    )
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-[#e8e6d8]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EmailVerificationBanner />
        <DashboardHeader friendCount={friends.length} onOpenAnalytics={() => setShowAnalytics(true)} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onClick={handleFriendClick}
            />
          ))}
        </div>
        
        {friends.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto border border-[#ffacd6]/20">
              <h3 className="text-lg font-semibold text-[#892f1a] mb-2">
                Ready to create your amazing friendship network? 🌈
              </h3>
              <p className="text-[#624a4a] mb-4">
                Start building beautiful connections that will bring happiness and joy to your life! ✨
              </p>
              <button className="bg-[#28428c] text-white px-6 py-2 rounded-lg hover:bg-[#1e3366] transition-colors duration-200">
                Start Your Friendship Journey! 🚀
              </button>
            </div>
          </div>
        )}
        
        <AddFriendButton onClick={() => setShowAddFriendForm(true)} />
      </div>
    </div>
  )
}
