import React, { useMemo, useState } from 'react';
import { DatabaseFriend } from '../hooks/useFriends';
import { TrendingUp, MessageSquare, Clock, Users } from 'lucide-react';
import { PieChart } from './PieChart';
import { useFriendDailySeries } from '../hooks/useFriendInteractions';

interface FriendAnalyticsPageProps {
  friends: DatabaseFriend[];
  onBack: () => void;
}

interface DayPoint {
  date: Date;
  sent: number;
  received: number;
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

function buildBars(points: DayPoint[], key: 'sent' | 'received', width: number, height: number, padding: number, color: string) {
  if (points.length === 0) return [];

  const maxY = Math.max(1, ...points.map(p => Math.max(p.sent, p.received)));
  const barWidth = Math.max(2, (width - padding * 2) / points.length - 2);

  return points.map((p, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, points.length - 1) - barWidth / 2;
    const barHeight = (p[key] / maxY) * (height - padding * 2);
    const y = height - padding - barHeight;
    
    return (
      <rect
        key={`${key}-${i}`}
        x={x}
        y={y}
        width={barWidth}
        height={barHeight}
        fill={color}
        opacity={0.8}
        rx={1}
      />
    );
  });
}

export const FriendAnalyticsPage: React.FC<FriendAnalyticsPageProps> = ({ friends, onBack: _onBack }) => {
  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id ?? '');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  const selectedFriend = useMemo(() => friends.find(f => f.id === selectedFriendId) ?? friends[0], [friends, selectedFriendId]);
  const { data: series } = useFriendDailySeries(selectedFriend?.id, 30);

  // Analytics summary
  const analytics = useMemo(() => {
    if (!friends.length) return null;
    
    const totalSent = friends.reduce((sum, f) => sum + f.messages_sent_count, 0);
    const totalReceived = friends.reduce((sum, f) => sum + f.messages_received_count, 0);
    const totalMessages = totalSent + totalReceived;
    const avgMessagesPerFriend = totalMessages / friends.length;
    
    // Find most active friend
    const mostActiveFriend = friends.reduce((prev, current) => 
      (prev.messages_sent_count + prev.messages_received_count) > (current.messages_sent_count + current.messages_received_count) ? prev : current
    );
    
    // Find friend to reconnect with (longest time since last contact)
    const now = new Date().getTime();
    const reconnectFriend = friends.reduce((prev, current) => {
      const prevDays = Math.floor((now - new Date(prev.last_contacted).getTime()) / (1000 * 60 * 60 * 24));
      const currentDays = Math.floor((now - new Date(current.last_contacted).getTime()) / (1000 * 60 * 60 * 24));
      return currentDays > prevDays ? current : prev;
    });
    
    return {
      totalSent,
      totalReceived,
      totalMessages,
      avgMessagesPerFriend: Math.round(avgMessagesPerFriend),
      mostActiveFriend,
      reconnectFriend,
      reconnectDays: Math.floor((now - new Date(reconnectFriend.last_contacted).getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [friends]);

  const pieChartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: 'Sent', value: analytics.totalSent, color: 'var(--blue)' },
      { label: 'Received', value: analytics.totalReceived, color: 'var(--pink)' },
    ];
  }, [analytics]);

  

  const width = 800;
  const height = 320;
  const padding = 40;

  const sentPoints = buildPolyline(series, 'sent', width, height, padding);
  const receivedPoints = buildPolyline(series, 'received', width, height, padding);
  const sentBars = buildBars(series, 'sent', width, height, padding, 'var(--blue)');
  const receivedBars = buildBars(series, 'received', width, height, padding, 'var(--pink)');

  const maxY = Math.max(1, ...series.map(p => Math.max(p.sent, p.received)));
  const yTicks = [0, Math.ceil(maxY * 0.25), Math.ceil(maxY * 0.5), Math.ceil(maxY * 0.75), maxY];

  if (!friends.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue">Connection Analytics</h2>
        </div>
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-blue">No connections added yet. Add some connections to see analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue">Connection Analytics Dashboard</h2>
        </div>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
                <div className="bg-blue/10 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue" />
              </div>
              <div>
                <p className="text-sm text-blue">Total Messages</p>
                <p className="text-xl font-semibold text-blue">{analytics.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
                <div className="bg-pink/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red" />
              </div>
              <div>
                <p className="text-sm text-blue">Avg per Connection</p>
                <p className="text-xl font-semibold text-blue">{analytics.avgMessagesPerFriend}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-blue">Most Active</p>
                <p className="text-sm font-semibold text-blue truncate">{analytics.mostActiveFriend.name}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-blue">Reconnect With</p>
                <p className="text-sm font-semibold text-blue truncate">{analytics.reconnectFriend.name}</p>
                <p className="text-xs text-blue">{analytics.reconnectDays} days ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-blue mb-1">Select Connection</label>
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
              >
                {friends.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-blue mb-1">Chart Type</label>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    chartType === 'line'
                      ? 'bg-white text-blue shadow-sm'
                        : 'text-blue hover:text-blue'
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    chartType === 'bar'
                      ? 'bg-white text-blue shadow-sm'
                      : 'text-blue hover:text-blue'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    chartType === 'pie'
                      ? 'bg-white text-blue shadow-sm'
                      : 'text-blue hover:text-blue'
                  }`}
                >
                  Pie
                </button>
                {/* scatter option removed */}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
              <span className="inline-block w-4 h-1 bg-blue rounded" />
              <span className="text-xs text-blue">Sent ({selectedFriend?.messages_sent_count || 0})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-4 h-1 bg-pink rounded" />
              <span className="text-xs text-blue">Received ({selectedFriend?.messages_received_count || 0})</span>
            </div>
          </div>
        </div>

          {selectedFriend && (
          <div className="mb-4 p-4 bg-cream rounded-lg">
            <h3 className="text-md font-semibold text-blue mb-2">
              {selectedFriend.name} - Communication Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue">Total Messages</p>
                <p className="font-semibold text-blue">
                  {selectedFriend.messages_sent_count + selectedFriend.messages_received_count}
                </p>
              </div>
              <div>
                <p className="text-blue">Last Contact</p>
                <p className="font-semibold text-blue">
                  {new Date(selectedFriend.last_contacted).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-blue">Total Interactions</p>
                <p className="font-semibold text-blue">{selectedFriend.total_interactions}</p>
              </div>
              <div>
                <p className="text-blue">Response Rate</p>
                <p className="font-semibold text-blue">
                  {selectedFriend.messages_sent_count > 0 
                    ? Math.round((selectedFriend.messages_received_count / selectedFriend.messages_sent_count) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {chartType === 'pie' ? (
            <div className="flex justify-center items-center" style={{ height }}>
              <PieChart data={pieChartData} size={Math.min(width, height)} />
            </div>
          ) : (
            <svg width={width} height={height} className="w-full">
              {/* Grid lines */}
              {yTicks.map((t, i) => {
                const y = height - padding - (t / maxY) * (height - padding * 2);
                return (
                  <line key={`grid-${i}`} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--muted)" strokeOpacity={0.06} strokeWidth={1} />
                );
              })}

              {/* Axes */}
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--muted)" strokeOpacity={0.08} strokeWidth={2} />
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--muted)" strokeOpacity={0.08} strokeWidth={2} />

              {/* Y ticks and labels */}
              {yTicks.map((t, i) => {
                const y = height - padding - (t / maxY) * (height - padding * 2);
                return (
                  <g key={`y-tick-${i}`}>
                    <line x1={padding - 4} y1={y} x2={padding} y2={y} stroke="var(--muted)" strokeOpacity={0.9} strokeWidth={1} />
                    <text x={padding - 8} y={y + 4} fontSize="12" textAnchor="end" fill="var(--muted)">{t}</text>
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
                  <text key={`x-label-${i}`} x={x} y={height - padding + 20} fontSize="12" textAnchor="middle" fill="var(--muted)">{label}</text>
                );
              })}

              {/* Chart content */}
              {chartType === 'bar' ? (
                <>
                  {receivedBars}
                  {sentBars}
                </>
              ) : (
                <>
                  <polyline fill="none" stroke="var(--pink)" strokeWidth="3" points={receivedPoints} />
                  <polyline fill="none" stroke="var(--blue)" strokeWidth="3" points={sentPoints} />
                  
                  {/* Data points */}
                  {series.map((p, i) => {
                    const x = padding + (i * (width - padding * 2)) / Math.max(1, series.length - 1);
                    const sentY = height - padding - (p.sent / maxY) * (height - padding * 2);
                    const receivedY = height - padding - (p.received / maxY) * (height - padding * 2);
                    return (
                      <g key={`points-${i}`}>
                        <circle cx={x} cy={sentY} r="4" fill="var(--blue)" />
                        <circle cx={x} cy={receivedY} r="4" fill="var(--pink)" />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-blue">
            Message activity over the last 30 days
              {selectedFriend && (
              <span className="ml-2 text-blue font-medium">
                • {selectedFriend.name}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FriendAnalyticsPage;


