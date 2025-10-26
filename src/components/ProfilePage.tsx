import React from 'react';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';
import { DatabaseFriend } from '../hooks/useFriends';
import { User, BarChart2, MessageSquare } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile | null;
  friends: DatabaseFriend[];
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, friends, onBack }) => {
  const mostMessagedFriend = friends.reduce((prev, current) => {
    const prevTotal = prev.messages_sent_count + prev.messages_received_count;
    const currentTotal = current.messages_sent_count + current.messages_received_count;
    return prevTotal > currentTotal ? prev : current;
  }, friends[0]);

  const totalMessages = friends.reduce((sum, f) => sum + f.messages_sent_count + f.messages_received_count, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#28428c]">My Profile</h2>
          <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-100 text-[#28428c] rounded-lg hover:bg-gray-200 transition-colors duration-200">
            Back to Dashboard
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#28428c]">{profile?.full_name}</h3>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#28428c] mb-4">Your Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <BarChart2 className="w-6 h-6 text-[#28428c]" />
              <div>
                <p className="text-sm text-[#28428c]">Most Messaged Friend</p>
                <p className="text-lg font-semibold text-[#28428c]">{mostMessagedFriend?.name}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-[#28428c]" />
              <div>
                <p className="text-sm text-[#28428c]">Total Messages</p>
                <p className="text-lg font-semibold text-[#28428c]">{totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">More detailed analytics and profile editing coming soon!</p>
        </div>
      </div>
    </div>
  );
};
