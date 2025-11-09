import React, { useEffect, useRef, useState } from 'react';
import { Umbrella, Users, BarChart3, BookOpen, Home, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../hooks/useUserProfile';
import HelpButton from './HelpButton';

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
  onOpenJournal: _onOpenJournal, 
  currentView = 'dashboard',
  onViewChange 
}) => {
  const { user, signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-md border border-pink/20">
          <Umbrella className="w-8 h-8 text-blue" />
          <h1 className="text-2xl font-bold text-blue">Net-umbrella</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-blue">
            Welcome, <span className="font-medium text-blue">
              {userProfile?.full_name || user?.email}
            </span>
          </div>
          <HelpButton />
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-2 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
                id="options-menu"
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
                title="Profile menu"
              >
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span className="px-2">Profile</span>
                )}
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
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
      </div>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange?.('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-blue text-white shadow-sm'
                  : 'text-blue hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onViewChange?.('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'analytics'
                  ? 'bg-blue text-white shadow-sm'
                  : 'text-blue hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => onViewChange?.('journal')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'journal'
                  ? 'bg-blue text-white shadow-sm'
                  : 'text-blue hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Journal</span>
            </button>
            
            <Link
              to="/dashboard/events"
              className={`flex items:center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-blue hover:bg-gray-50`}
            >
              <MapPin className="w-4 h-4" />
              <span>Events</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-blue mb-2">
          {currentView === 'analytics' ? 'Connection Analytics Dashboard ' :
           currentView === 'journal' ? 'Your Personal Journal ' :
           'Your Amazing Network! '}
        </h2>
        <div className="flex items-center justify-center space-x-2 text-blue">
          <Users className="w-4 h-4" />
          <p className="text-sm">
            {currentView === 'analytics' 
              ? `Analyze communication patterns across your ${friendCount} connections`
              : currentView === 'journal'
              ? 'Reflect on your connections journey and growth'
              : `You're nurturing ${friendCount} wonderful connections that bring joy to your life! `
            }
          </p>
        </div>
      </div>

      
    </div>
  );
};