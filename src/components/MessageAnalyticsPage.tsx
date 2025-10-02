import React, { useMemo, useState } from 'react';
import { Friend } from '../types/Friend';
import { getReceivedMessageCount, getSentMessageCount } from '../utils/messageAnalytics';

interface MessageAnalyticsPageProps {
  friends: Friend[];
  onBack: () => void;
}

interface DayPoint {
  date: Date;
  sent: number;
  received: number;
}

// Generate bogus per-day counts from existing message history counts, spread over 30 days
function generateSyntheticSeries(friend: Friend): DayPoint[] {
  const totalSent = friend.socials.reduce((sum, s) => sum + getSentMessageCount(s.messageHistory), 0);
  const totalReceived = friend.socials.reduce((sum, s) => sum + getReceivedMessageCount(s.messageHistory), 0);

  const days = 30;
  const today = new Date();
  const points: DayPoint[] = [];

  let sentRemaining = totalSent;
  let receivedRemaining = totalReceived;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // Distribute counts with some variation (bogus data)
    const sent = Math.max(0, Math.round((totalSent / days) + ((Math.sin(i / 3) * totalSent) / (days * 6)) + (Math.random() * 2 - 1)));
    const received = Math.max(0, Math.round((totalReceived / days) + ((Math.cos(i / 4) * totalReceived) / (days * 6)) + (Math.random() * 2 - 1)));

    // Ensure totals roughly sum up to original counts by decreasing remainder towards end
    const daysLeft = i + 1;
    const sentCap = Math.min(sent, sentRemaining - Math.max(0, sentRemaining - Math.ceil((daysLeft - 1) * (totalSent / days))));
    const receivedCap = Math.min(received, receivedRemaining - Math.max(0, receivedRemaining - Math.ceil((daysLeft - 1) * (totalReceived / days))));

    const sentFinal = isFinite(sentCap) && sentCap >= 0 ? sentCap : 0;
    const receivedFinal = isFinite(receivedCap) && receivedCap >= 0 ? receivedCap : 0;

    sentRemaining -= sentFinal;
    receivedRemaining -= receivedFinal;

    points.push({ date: d, sent: sentFinal, received: receivedFinal });
  }

  // If any remainder left, add to the last day
  if (points.length > 0) {
    points[points.length - 1].sent += Math.max(0, sentRemaining);
    points[points.length - 1].received += Math.max(0, receivedRemaining);
  }

  return points;
}

function formatDateLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildPolyline(points: DayPoint[], key: 'sent' | 'received', width: number, height: number, padding: number) {
  if (points.length === 0) return '';

  const maxY = Math.max(1, ...points.map(p => Math.max(p.sent, p.received)));
  const stepX = (width - padding * 2) / Math.max(1, points.length - 1);

  const toY = (v: number) => height - padding - (v / maxY) * (height - padding * 2);

  return points.map((p, i) => `${padding + i * stepX},${toY(p[key])}`).join(' ');
}

export const MessageAnalyticsPage: React.FC<MessageAnalyticsPageProps> = ({ friends, onBack }) => {
  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id ?? '');

  const selectedFriend = useMemo(() => friends.find(f => f.id === selectedFriendId) ?? friends[0], [friends, selectedFriendId]);
  const series = useMemo(() => selectedFriend ? generateSyntheticSeries(selectedFriend) : [], [selectedFriend]);

  // Recommendation section: pick the friend with the longest time since last contact
  const recommended = useMemo(() => {
    if (!friends.length) return null;
    const now = new Date().getTime();
    const withDays = friends.map(f => ({
      friend: f,
      days: Math.max(0, Math.floor((now - f.lastContacted.getTime()) / (1000 * 60 * 60 * 24)))
    }));
    withDays.sort((a, b) => b.days - a.days);
    return withDays[0];
  }, [friends]);

  const suggestionText = useMemo(() => {
    if (!recommended) return '';
    const name = recommended.friend.name.split(' ')[0] || recommended.friend.name;
    const days = recommended.days;
    const openers = [
      `Hey ${name}!`,
      `Hi ${name},`,
      `Hey there ${name}!`,
      `Yo ${name}!`
    ];
    const bodies = [
      `it's been ${days} day${days === 1 ? '' : 's'} — how have you been?`,
      `just realized it's been a bit (${days} days)! What's new with you?`,
      `been thinking of you — what have you been up to lately?`,
      `want to catch up soon? I miss our chats!`
    ];
    const closes = [
      `Got time this week for a quick catch-up?`,
      `Want to grab coffee or hop on a call?`,
      `Hope you're doing well — would love to connect!`,
      `No rush, just saying hi and sending good vibes!`
    ];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(openers)} ${pick(bodies)} ${pick(closes)}`;
  }, [recommended]);

  const width = 720;
  const height = 280;
  const padding = 28;

  const sentPoints = buildPolyline(series, 'sent', width, height, padding);
  const receivedPoints = buildPolyline(series, 'received', width, height, padding);

  const maxY = Math.max(1, ...series.map(p => Math.max(p.sent, p.received)));
  const yTicks = [0, Math.ceil(maxY * 0.33), Math.ceil(maxY * 0.66), maxY];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#28428c]">Message Analytics (Last 30 Days)</h2>
        <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-100 text-[#624a41] rounded-lg hover:bg-gray-200 transition-colors duration-200">Back</button>
      </div>

      {recommended && (
        <div className="mb-6 border border-gray-100 rounded-lg p-4 bg-[#e8e6d8]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-md font-semibold text-[#28428c] mb-1">Who to reach out to next</h3>
              <p className="text-sm text-[#624a41]">
                It's been <span className="font-semibold text-[#892f1a]">{recommended.days} day{recommended.days === 1 ? '' : 's'}</span> since you last connected with <span className="font-semibold text-[#ffacd6]">{recommended.friend.name}</span>.
              </p>
            </div>
            <button
              onClick={() => setSelectedFriendId(recommended.friend.id)}
              className="px-3 py-2 text-sm bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
            >
              View in chart
            </button>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-[#624a41] mb-1">Suggested message</label>
            <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-[#624a41]">
              {suggestionText}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-[#624a41] mb-1">Select Friend</label>
          <select
            value={selectedFriendId}
            onChange={(e) => setSelectedFriendId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffacd6] focus:border-transparent"
          >
            {friends.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex items-end justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-1 bg-[#28428c] rounded" />
            <span className="text-xs text-[#624a41]">Sent</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-1 bg-[#ffacd6] rounded" />
            <span className="text-xs text-[#624a41]">Received</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={width} height={height} className="w-full">
          {/* Axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />

          {/* Y ticks */}
          {yTicks.map((t, i) => {
            const y = height - padding - (t / maxY) * (height - padding * 2);
            return (
              <g key={i}>
                <line x1={padding - 4} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" />
                <text x={padding - 8} y={y + 4} fontSize="10" textAnchor="end" fill="#6b7280">{t}</text>
              </g>
            );
          })}

          {/* X labels - show 6 evenly spaced */}
          {series.map((p, i) => {
            const show = i % Math.ceil(series.length / 6) === 0 || i === series.length - 1;
            if (!show) return null;
            const x = padding + (i * (width - padding * 2)) / Math.max(1, series.length - 1);
            const label = formatDateLabel(p.date);
            return (
              <text key={i} x={x} y={height - padding + 16} fontSize="10" textAnchor="middle" fill="#6b7280">{label}</text>
            );
          })}

          {/* Lines */}
          <polyline fill="none" stroke="#28428c" strokeWidth="2" points={sentPoints} />
          <polyline fill="none" stroke="#ffacd6" strokeWidth="2" points={receivedPoints} />
        </svg>
      </div>
    </div>
  );
};

export default MessageAnalyticsPage;


