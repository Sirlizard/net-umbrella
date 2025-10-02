import React from 'react';
import { Friend } from '../types/Friend';
import { formatLastContacted } from '../utils/timeFormatter';
import { MessageCircle, Clock } from 'lucide-react';

interface FriendCardProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onClick }) => {
  const getContactStatusColor = (lastContacted: Date) => {
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) return 'text-green-600';
    if (diffDays <= 14) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getContactStatusBorder = (lastContacted: Date) => {
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) return 'border-l-green-500';
    if (diffDays <= 14) return 'border-l-yellow-500';
    return 'border-l-red-400';
  };

  return (
    <div
      onClick={() => onClick(friend)}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer 
                  border-l-4 ${getContactStatusBorder(friend.lastContacted)} hover:scale-[1.02] 
                  border border-gray-100 hover:border-[#ffacd6] group`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#28428c] group-hover:text-[#892f1a] transition-colors duration-200 mb-1">
              {friend.name}
            </h3>
            <p className="text-sm text-[#28428c] mb-2">
              {friend.socials.length} contact method{friend.socials.length !== 1 ? 's' : ''}
            </p>
          </div>
          <MessageCircle className="w-5 h-5 text-[#ffacd6] group-hover:text-[#28428c] transition-colors duration-200" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${getContactStatusColor(friend.lastContacted)}`} />
          <span className={`text-sm font-medium ${getContactStatusColor(friend.lastContacted)}`}>
            Last contact: {formatLastContacted(friend.lastContacted)}
          </span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#ffacd6] font-medium">
              Ready to spread some friendship joy! 💕
            </span>
            <div className="w-2 h-2 rounded-full bg-[#ffacd6] group-hover:bg-[#28428c] transition-colors duration-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};