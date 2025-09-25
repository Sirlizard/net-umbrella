import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper } from './components/AuthWrapper';

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;