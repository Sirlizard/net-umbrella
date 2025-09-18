import React from 'react';
import { Plus } from 'lucide-react';

export const AddFriendButton: React.FC = () => {
  const handleAddFriend = () => {
    // Future implementation for adding friends
    console.log('Add friend clicked');
  };

  return (
    <button
      onClick={handleAddFriend}
      className="fixed bottom-6 right-6 bg-[#28428c] hover:bg-[#1e3366] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
      aria-label="Add new friend"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};