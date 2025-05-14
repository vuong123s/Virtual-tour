import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import TourCreate from "./pages/TourCreate";
import Home from "./pages/Home";
import Tour from "./pages/Tour";
import TourUpdate from "./pages/TourUpdate";
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Admin from './pages/Admin'; // Import the Admin component
import UserInterface from './pages/UserInterface';


export default function App() {
  return (
    <AuthProvider> 
      <div className="app-container">


        <Routes>
          <Route path="/admin" element={<Admin />} /> {/* Admin route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/tours" element={<Home />} /> */}
          <Route
            path="/tours"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/tour/:tourId" element={<Tour />} />
          <Route path="/tour-update/:tourId" element={<TourUpdate />} />
          <Route path="/tour-create" element={<TourCreate />} />

          <Route path="/interface" element={<UserInterface />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth(); 
  return user ? children : <Navigate to="/login" />;
}