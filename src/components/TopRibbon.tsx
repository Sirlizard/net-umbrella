import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MapPin, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TopRibbon: React.FC = () => {
  const location = useLocation();

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { to: '/dashboard/journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/dashboard/events', label: 'Events', icon: <MapPin className="w-4 h-4" /> },
    { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div />
        <div className="flex items-center space-x-3">
          {items.map((it) => {
            const active = location.pathname === it.to;
            return (
              <Link key={it.to} to={it.to} className={`btn ${active ? 'btn-primary' : 'btn-secondary'} text-sm flex items-center space-x-2`}> 
                <span className="opacity-90">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light/dark" className="btn btn-ghost">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopRibbon;
