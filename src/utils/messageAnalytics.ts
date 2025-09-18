import { Friend, MessageRecord } from '../types/Friend';

export const getReceivedMessageCount = (messageHistory: MessageRecord[]): number => {
  return messageHistory.filter(msg => msg.type === 'received').length;
};

export const getTotalReceivedMessages = (friend: Friend): number => {
  return friend.socials.reduce((total, social) => {
    return total + getReceivedMessageCount(social.messageHistory);
  }, 0);
};

export const getAverageResponseTime = (messageHistory: MessageRecord[]): number | null => {
  const intervals: number[] = [];
  
  for (let i = 1; i < messageHistory.length; i++) {
    const current = messageHistory[i];
    const previous = messageHistory[i - 1];
    
    // Calculate interval between consecutive messages
    const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime();
    intervals.push(timeDiff);
  }
  
  if (intervals.length === 0) return null;
  
  const averageMs = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return averageMs;
};

export const formatResponseTime = (averageMs: number | null): string => {
  if (averageMs === null) return 'No data';
  
  const days = Math.floor(averageMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((averageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h avg`;
  } else if (hours > 0) {
    return `${hours}h avg`;
  } else {
    const minutes = Math.floor(averageMs / (1000 * 60));
    return `${minutes}m avg`;
  }
};

export const getLastReceivedMessage = (messageHistory: MessageRecord[]): Date | null => {
  const receivedMessages = messageHistory
    .filter(msg => msg.type === 'received')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return receivedMessages.length > 0 ? receivedMessages[0].timestamp : null;
};