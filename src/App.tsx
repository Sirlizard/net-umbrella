import React, { useState } from 'react';
import { Friend } from './types/Friend';
import { mockFriends } from './data/mockFriends';
import { FriendCard } from './components/FriendCard';
import { DashboardHeader } from './components/DashboardHeader';
import { AddFriendButton } from './components/AddFriendButton';
import { FriendDetailView } from './components/FriendDetailView';

function App() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  const handleBackToDashboard = () => {
    setSelectedFriend(null);
  };

  const handleUpdateFriend = (updatedFriend: Friend) => {
    setFriends(prevFriends => 
      prevFriends.map(friend => 
        friend.id === updatedFriend.id ? updatedFriend : friend
      )
    );
    setSelectedFriend(updatedFriend);
  };

  // Show friend detail view if a friend is selected
  if (selectedFriend) {
    return (
      <FriendDetailView
        friend={selectedFriend}
        onBack={handleBackToDashboard}
        onUpdateFriend={handleUpdateFriend}
      />
    );
  }

  // Show main dashboard
  return (
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
                Ready to build your network?
              </h3>
              <p className="text-[#624a4a] mb-4">
                Start adding friends to keep track of your meaningful connections.
              </p>
              <button className="bg-[#28428c] text-white px-6 py-2 rounded-lg hover:bg-[#1e3366] transition-colors duration-200">
                Add Your First Friend
              </button>
            </div>
          </div>
        )}
        
        <AddFriendButton />
      </div>
    </div>
  );
}

export default App;