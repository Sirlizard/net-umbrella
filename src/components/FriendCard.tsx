import React from 'react';
import { Friend } from '../types/Friend';
// compact formatter used inside component
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
  return 'text-red-600';
  };

  const getRecencyLevel = (lastContacted: Date) => {
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24));
    const targetDays = frequencyToTargetDays(friend.contactFrequency);
    if (diffDays === 0) return 'good';
    if (diffDays <= targetDays) return 'ok';
    return 'overdue';
  }

  const formatShort = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}y`;
  }

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
      className={`card border-l-4 ${getContactStatusBorder(friend.lastContacted)} hover:scale-[1.02] cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100 group bg-white p-4 rounded-lg`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-medium text-red-600">
            {friend.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={friend.avatarUrl} alt={`${friend.name} avatar`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">{friend.name?.charAt(0) || '?'}</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-red-600 group-hover:text-pink-600 transition-colors duration-200 truncate">
              {friend.name}
            </h3>
            <div className="text-xs text-gray-400">{friend.socials.length} {friend.socials.length === 1 ? 'contact' : 'contacts'}</div>
          </div>

          <p className="text-sm text-gray-600 mt-2 truncate">{friend.bio ? friend.bio : ''}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${getContactStatusColor(friend.lastContacted)}`} />
              {/* compact label with color backdrop */}
              {(() => {
                const level = getRecencyLevel(friend.lastContacted)
                const mapping: Record<string, string> = {
                  good: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200',
                  ok: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200',
                  overdue: 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200'
                }
                return (
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${mapping[level]}`}>{formatShort(friend.lastContacted)}</span>
                )
              })()}
            </div>

            <div className="text-right">
              {streak > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue">
                  <Flame className="w-4 h-4 text-[#ff6a00]" />
                  {streak}d
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-medium">Let’s connect</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};