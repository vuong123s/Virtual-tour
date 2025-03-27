import { Routes, Route, Navigate } from 'react-router-dom';
import VirtualTourEditor from './components/VirtualTourEditor';
import Navbar from './components/Navbar';
import Slider from './components/Slider'; 
import TourList from './components/TourList';
import LoginPage from './pages/LoginPage';
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
              <TourList />
              {/* <Slider />   */}
              {/* <VirtualTourEditor /> */}
            </>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
