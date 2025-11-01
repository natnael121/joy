import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/Auth/LoginPage';
import { HomePage } from './components/Dashboard/HomePage';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return currentUser ? <HomePage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
