import { useMemo } from 'react';
import { Friend } from '../types/Friend';
import { getLastSentMessage } from '../utils/messageAnalytics';

export const useFriendHighlights = (friends: Friend[]) => {
  const friendToRespond = useMemo(() => {
    if (!friends || friends.length === 0) {
      return null;
    }

    // Find the friend with the oldest last sent message
    const friendWithOldestLastSent = friends.reduce((oldestFriend, currentFriend) => {
      const oldestLastSent = oldestFriend ? getLastSentMessage(oldestFriend.socials.flatMap(s => s.messageHistory)) : null;
      const currentLastSent = getLastSentMessage(currentFriend.socials.flatMap(s => s.messageHistory));

      if (!currentLastSent) {
        return oldestFriend;
      }
      if (!oldestLastSent) {
        return currentFriend;
      }

      return currentLastSent < oldestLastSent ? currentFriend : oldestFriend;
    }, null as Friend | null);

    return friendWithOldestLastSent;
  }, [friends]);

  return { friendToRespond };
};
