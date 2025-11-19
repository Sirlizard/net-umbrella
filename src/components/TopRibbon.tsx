import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MapPin, User, Sun, Moon, Umbrella, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import QuickAddFriend from './QuickAddFriend';
import QuickAddEvent from './QuickAddEvent';

const TopRibbon: React.FC = () => {
  const location = useLocation();

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { to: '/dashboard/journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/dashboard/events', label: 'Events', icon: <MapPin className="w-4 h-4" /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];
  const profileItem = items.find(i => i.to === '/profile');
  const navItems = items.filter(i => i.to !== '/profile');

  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="inline-flex items-center space-x-3">
            <Umbrella className="w-7 h-7 text-blue" />
            <span className="text-lg font-bold text-blue">Net Umbrella</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          {navItems.map((it) => {
            const active = location.pathname === it.to;
            return (
              <Link key={it.to} to={it.to} className={`btn ${active ? 'btn-primary' : 'btn-secondary'} text-sm flex items-center space-x-2`}> 
                <span className="opacity-90">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="md:hidden">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="btn btn-secondary text-sm">Dashboard</Link>
            <Link to="/dashboard/events" className="btn btn-secondary text-sm">Events</Link>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <QuickAddFriend />
            <QuickAddEvent />
          </div>

          <div className="flex items-center space-x-3 pl-4 ml-4 border-l border-gray-200">
            {profileItem && (
              <Link to={profileItem.to} className={`hidden md:inline-flex btn btn-secondary px-3 py-1.5 text-sm flex items-center space-x-2`}>
                <span className="opacity-90">{profileItem.icon}</span>
                <span>{profileItem.label}</span>
              </Link>
            )}
            <button onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light/dark" className="btn btn-ghost px-3 py-1.5">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRibbon;
