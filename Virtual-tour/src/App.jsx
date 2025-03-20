import { Routes, Route } from 'react-router-dom';
import VirtualTourEditor from './components/VirtualTourEditor';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes key={user ? 'authenticated' : 'guest'}>
        <Route path="/" element={
          user ? (
            <>
              <Navbar />
              <VirtualTourEditor />
            </>
          ) : (
            <Navbar />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
