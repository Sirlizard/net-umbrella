import React from 'react';
import { Friend } from '../types/Friend';

interface ResponseReminderProps {
  friend: Friend | null;
}

export const ResponseReminder: React.FC<ResponseReminderProps> = ({ friend }) => {
  if (!friend) {
    return null;
  }

  return (
    <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg shadow-md">
      <p className="font-bold text-lg">Response Reminder</p>
      <p>It looks like it's been a while since you last messaged <span className="font-semibold">{friend.name}</span>. Why not reach out and say hello?</p>
    </div>
  );
};
