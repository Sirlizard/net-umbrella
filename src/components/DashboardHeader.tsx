import React from 'react';
import { Umbrella, Users, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardHeaderProps {
  friendCount: number;
  onOpenAnalytics?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ friendCount, onOpenAnalytics }) => {
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
          <div className="text-sm text-[#624a4a]">
            Welcome, <span className="font-medium text-[#892f1a]">{user?.email}</span>
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
      
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#892f1a] mb-2">
          Your Amazing Friendship Network! ✨
        </h2>
        <div className="flex items-center justify-center space-x-2 text-[#624a4a]">
          <Users className="w-4 h-4" />
          <p className="text-sm">
            You're nurturing <span className="font-semibold text-[#28428c]">{friendCount}</span> wonderful connections that bring joy to your life! 🌟
          </p>
        </div>
        {onOpenAnalytics && (
          <div className="mt-4">
            <button
              onClick={onOpenAnalytics}
              className="px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1e3366] transition-colors duration-200"
            >
              Open Message Analytics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};