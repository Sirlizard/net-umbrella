import { AuthProvider } from './contexts/AuthContext';
import { AuthWrapper } from './components/AuthWrapper';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AuthWrapper />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;