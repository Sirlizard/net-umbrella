import React, { useState } from 'react';
import { Umbrella, Users, LogOut, BarChart3, BookOpen, Home, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../hooks/useUserProfile';

interface DashboardHeaderProps {
  friendCount: number;
  userProfile?: UserProfile | null;
  onOpenJournal?: () => void;
  currentView?: 'dashboard' | 'journal' | 'analytics' | 'profile' | 'locations';
  onViewChange?: (view: 'dashboard' | 'journal' | 'analytics' | 'profile' | 'locations') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  friendCount, 
  userProfile, 
  onOpenJournal, 
  currentView = 'dashboard',
  onViewChange 
}) => {
  const { user, signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-md border border-[#ffacd6]/20">
          <Umbrella className="w-8 h-8 text-[#28428c]" />
          <h1 className="text-2xl font-bold text-[#28428c]">Net-umbrella</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-[#28428c]">
            Welcome, <span className="font-medium text-[#28428c]">
              {userProfile?.full_name || user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1f326b] transition-colors duration-200"
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
                  : 'text-[#28428c] hover:bg-gray-50'
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
                  : 'text-[#28428c] hover:bg-gray-50'
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
                  : 'text-[#28428c] hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Journal</span>
            </button>
            <button
              onClick={() => onViewChange?.('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'profile'
                  ? 'bg-[#28428c] text-white shadow-sm'
                  : 'text-[#28428c] hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => onViewChange?.('locations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'locations'
                  ? 'bg-[#28428c] text-white shadow-sm'
                  : 'text-[#28428c] hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Locations</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#28428c] mb-2">
          {currentView === 'analytics' ? 'Friend Analytics Dashboard ' :
           currentView === 'journal' ? 'Your Personal Journal ' :
           currentView === 'profile' ? 'Your Profile' :
           currentView === 'locations' ? 'Find Nearby Locations' :
           'Your Amazing Friendship Network! '}
        </h2>
        <div className="flex items-center justify-center space-x-2 text-[#28428c]">
          <Users className="w-4 h-4" />
          <p className="text-sm">
            {currentView === 'analytics' ? 
              `Analyze communication patterns across your ${friendCount} connections` :
              currentView === 'journal' ?
              'Reflect on your friendship journey and growth' :
              currentView === 'profile' ?
              'View your profile and analytics' :
              currentView === 'locations' ?
              'Discover new places to connect' :
              `You're nurturing ${friendCount} wonderful connections that bring joy to your life! `
            }
          </p>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      {user && (
        <div className="relative inline-block text-left">
          <div>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              id="options-menu"
              aria-haspopup="true"
              aria-expanded="true"
            >
              Profile
              <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${isProfileMenuOpen ? '' : 'hidden'}`} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="py-1" role="none">
              <Link to="/profile" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem">
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 block w-full text-left px-4 py-2 text-sm"
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};