import React, { useState, useMemo } from 'react';
// profile not used here anymore; TopRibbon provides global navigation
import { useFriends, DatabaseFriend } from '../hooks/useFriends';
import { JournalPage } from './JournalPage';
import { FriendAnalyticsPage } from './FriendAnalyticsPage';
// DashboardHeader removed to avoid duplicate header (TopRibbon is the global header)
import { EmailVerificationBanner } from './EmailVerificationBanner';
import { AddFriendForm } from './AddFriendForm';
import { FriendDetailModal } from './FriendDetailModal';
import { Friend } from '../types/Friend';
import { FriendCard } from './FriendCard';

const EmptyDashboard = ({ onStart }: { onStart: () => void }) => (
  <div className="text-center py-16">
  <div className="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto border border-pink/20">
    <h3 className="text-lg font-semibold text-red mb-2">
        Ready to create your amazing network? 🌈
      </h3>
  <p className="text-blue mb-4">
        Start building beautiful connections that will bring happiness and joy to your life! ✨
      </p>
      <button onClick={onStart} className="bg-blue text-white px-6 py-2 rounded-lg hover:bg-blue-dark transition-colors duration-200">
        Start Your Connections Journey! 🚀
      </button>
    </div>
  </div>
);

const AddMoreFriends = ({ onAdd }: { onAdd: () => void }) => (
    <div className="mt-10">
  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink/20 flex items-center justify-between">
            <div>
  <h3 className="text-lg font-semibold text-blue">Keep growing your network</h3>
  <p className="text-blue text-sm">Add more connections and set up their details.</p>
            </div>
      <button onClick={onAdd} className="bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue-dark transition-colors duration-200">
        Add more connections
            </button>
        </div>
    </div>
);

export const DashboardPage: React.FC = () => {
  const { friends: dbFriends, loading: friendsLoading, addFriend, updateFriend } = useFriends();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriendDb, setSelectedFriendDb] = useState<DatabaseFriend | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'journal' | 'analytics'>('dashboard');

  const friends: Friend[] = useMemo(() => {
    return dbFriends.map(f => ({
      ...f,
      bio: f.bio ?? undefined,
      socials: [], // Placeholder for socials
      lastContacted: new Date(f.last_contacted),
      contactFrequency: typeof f.contact_frequency === 'number' ? f.contact_frequency : undefined,
    }));
  }, [dbFriends]);

  const handleAddFriend = async (friendData: { name: string; bio?: string; contact_frequency?: number }) => {
    const { data, error } = await addFriend(friendData);
    if (!error && data) {
      setShowAddFriend(false);
    } else if (error) {
      console.error(`Error adding friend: ${error}`);
      alert(`Error adding friend: ${error}`);
    }
  };

  const handleUpdateFriend = async (friendId: string, updates: Partial<DatabaseFriend>) => {
    const { error } = await updateFriend(friendId, updates);
    if (error) {
      console.error(`Error updating friend: ${error}`);
      alert(`Error updating friend: ${error}`);
    }
  };
  
  if (currentView === 'journal') {
    return <JournalPage onBack={() => setCurrentView('dashboard')} />
  }

  if (currentView === 'analytics') {
    return <FriendAnalyticsPage friends={dbFriends} onBack={() => setCurrentView('dashboard')} />
  }

  return (
  <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EmailVerificationBanner />
        {/* Header intentionally removed so TopRibbon is the sole header at the top of the app */}
        
        {friendsLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto mb-4"></div>
            <p className="text-blue">Loading your connections...</p>
          </div>
        ) : (
          <>
            {friends.length === 0 ? (
              <EmptyDashboard onStart={() => setShowAddFriend(true)} />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      friend={friend}
                      onClick={(f) => {
                        const match = dbFriends.find(df => df.id === f.id) || null;
                        setSelectedFriendDb(match);
                      }}
                    />
                  ))}
                </div>
                <AddMoreFriends onAdd={() => setShowAddFriend(true)} />
              </div>
            )}
          </>
        )}
      </div>

      {showAddFriend && (
        <AddFriendForm onClose={() => setShowAddFriend(false)} onAddFriend={handleAddFriend} />
      )}

      {selectedFriendDb && (
        <FriendDetailModal
          friend={selectedFriendDb}
          onClose={() => setSelectedFriendDb(null)}
          onUpdate={(id, updates) => handleUpdateFriend(id, updates as Partial<DatabaseFriend>)}
        />
      )}
    </div>
  );
}
