import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper } from './components/AuthWrapper';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </Router>
  );
}

export default App;