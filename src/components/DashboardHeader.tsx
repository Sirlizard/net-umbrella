import React from 'react';
import { Umbrella, Users, LogOut, BarChart3, BookOpen, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../hooks/useUserProfile';

interface DashboardHeaderProps {
  friendCount: number;
  userProfile?: UserProfile | null;
  onOpenJournal?: () => void;
  currentView?: 'dashboard' | 'journal' | 'analytics';
  onViewChange?: (view: 'dashboard' | 'journal' | 'analytics') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  friendCount, 
  userProfile, 
  onOpenJournal, 
  currentView = 'dashboard',
  onViewChange 
}) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-md border border-[#ffacd6]/20">
          <Umbrella className="w-8 h-8 text-[#28428c]" />
          <h1 className="text-2xl font-bold text-[#892f1a]">Net-umbrella</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-[#624a41]">
            Welcome, <span className="font-medium text-[#892f1a]">
              {userProfile?.full_name || user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange?.('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-[#28428c] text-white shadow-sm'
                  : 'text-[#624a41] hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange?.('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'analytics'
                  ? 'bg-[#28428c] text-white shadow-sm'
                  : 'text-[#624a41] hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => onViewChange?.('journal')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'journal'
                  ? 'bg-[#28428c] text-white shadow-sm'
                  : 'text-[#624a41] hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Journal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#892f1a] mb-2">
          {currentView === 'analytics' ? 'Friend Analytics Dashboard 📊' :
           currentView === 'journal' ? 'Your Personal Journal 📝' :
           'Your Amazing Friendship Network! ✨'}
        </h2>
        <div className="flex items-center justify-center space-x-2 text-[#624a41]">
          <Users className="w-4 h-4" />
          <p className="text-sm">
            {currentView === 'analytics' ? 
              `Analyze communication patterns across your ${friendCount} connections` :
              currentView === 'journal' ?
              'Reflect on your friendship journey and growth' :
              `You're nurturing ${friendCount} wonderful connections that bring joy to your life! 🌟`
            }
          </p>
        </div>
      </div>
    </div>
  );
};