import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { LandingPage } from './LandingPage';
import { DashboardPage } from './DashboardPage';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { LocationsPage } from './LocationsPage';
import { JournalPage } from './JournalPage';
import { useUserProfile } from '../hooks/useUserProfile';
import { useFriends } from '../hooks/useFriends';

export const AuthWrapper: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'signup' | 'login'>('landing');
  const { profile } = useUserProfile();
  const { friends: dbFriends } = useFriends();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8e6d8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#28428c] mx-auto mb-4"></div>
          <p className="text-[#28428c]">Loading your friendship network...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Allow public access to the Locations page so anyone can use the feature
    if (location.pathname === '/locations') {
      return <LocationsPage onBack={() => navigate('/')} />;
    }
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
    }
    return <LandingPage onGetStarted={() => setAuthView('signup')} onSignIn={() => setAuthView('login')} />;
  }

  // User is authenticated, show the main dashboard
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage profile={profile} friends={dbFriends} onBack={() => navigate('/dashboard')} />} />
      <Route path="/dashboard/locations" element={<LocationsPage onBack={() => navigate('/dashboard')} />} />
      <Route path="/dashboard/journal" element={<JournalPage onBack={() => navigate('/dashboard')} />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};
