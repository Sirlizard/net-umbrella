import React from 'react';
import { Friend } from '../types/Friend';
import { formatLastContacted } from '../utils/timeFormatter';
import { MessageCircle, Clock, Flame } from 'lucide-react';
import { useFriendStreak } from '../hooks/useFriendStreak';
import { frequencyToTargetDays } from '../utils/contactPreference';

interface FriendCardProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onClick }) => {
  const { streak } = useFriendStreak(friend.id, 60)
  const getContactStatusColor = (lastContacted: Date) => {
    const now = new Date();
    const isToday =
      lastContacted.getFullYear() === now.getFullYear() &&
      lastContacted.getMonth() === now.getMonth() &&
      lastContacted.getDate() === now.getDate();

    if (isToday) return 'text-green-600';

    const diffDays = Math.floor(Math.abs(now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24));
    const targetDays = frequencyToTargetDays(friend.contactFrequency);
  if (diffDays <= targetDays) return 'text-yellow-600';
  return 'text-red';
  };

  const getContactStatusBorder = (lastContacted: Date) => {
    const now = new Date();
    const isToday =
      lastContacted.getFullYear() === now.getFullYear() &&
      lastContacted.getMonth() === now.getMonth() &&
      lastContacted.getDate() === now.getDate();

    if (isToday) return 'border-l-green-500';

    const diffDays = Math.floor(Math.abs(now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24));
    const targetDays = frequencyToTargetDays(friend.contactFrequency);
    if (diffDays <= targetDays) return 'border-l-yellow-500';
    return 'border-l-red-400';
  };

  return (
    <div
      onClick={() => onClick(friend)}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer 
                  border-l-4 ${getContactStatusBorder(friend.lastContacted)} hover:scale-[1.02] 
                  border border-gray-100 hover:border-pink group`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue group-hover:text-red transition-colors duration-200 mb-1">
              {friend.name}
            </h3>
            <p className="text-sm text-blue mb-2">
              {friend.socials.length} contact method{friend.socials.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-pink group-hover:text-blue transition-colors duration-200" />
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              {friend.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={friend.avatarUrl} alt={`${friend.name} avatar`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-blue">{friend.name?.charAt(0) || '?'}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${getContactStatusColor(friend.lastContacted)}`} />
          <span className={`text-sm font-medium ${getContactStatusColor(friend.lastContacted)}`}>
            Last contact: {formatLastContacted(friend.lastContacted)}
          </span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {streak > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue">
                <Flame className="w-3.5 h-3.5 text-[#ff6a00]" />
                {streak} day{streak === 1 ? '' : 's'} streak
              </span>
            ) : (
              <span className="text-xs text-pink font-medium">
                Ready to spark a connection! 
              </span>
            )}
            <div className="w-2 h-2 rounded-full bg-pink group-hover:bg-blue transition-colors duration-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};