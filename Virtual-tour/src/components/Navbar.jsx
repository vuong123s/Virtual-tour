import React, { useState, useEffect } from 'react';
import { FaMap } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { Link } from 'react-router-dom';
import Logo1 from '../assets/logo.png';
import Login from './Login';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user, forceUpdate, logout } = useAuth();
  
  useEffect(() => {
    const handleUserChange = () => {
      forceUpdate();
    };
    window.addEventListener('userUpdate', handleUserChange);
    return () => window.removeEventListener('userUpdate', handleUserChange);
  }, [forceUpdate]);
  
  const handleUserIconClick = () => {
    if (user) {
      // If user is logged in, don't show login popup
      return;
    }
    setShowLogin(prev => !prev); // Toggle the state
  };

  return (
    <div className="relative z-50">
      {/* Using Login component */}
      <Login 
        isPopupActive={showLogin}
        onClose={() => setShowLogin(false)}
      />
      <div className="py-2 bg-gray-800 fixed top-0 left-0 right-0 text-white border-b border-gray-700 transition-all duration-400 ease-in-out">
        <div className="max_padd_container flex justify-between items-center">
          <div className="mr-auto">
            <Link to="/"><img src={Logo1} alt="Logo" className="h-10" /></Link>
          </div>
          <div className="flex items-center space-x-6 text-[20px]">
            <div className="p-2 rounded-full hover:bg-gray-700">
              <FaMap />
            </div>
            <div className="p-2 rounded-full hover:bg-gray-700">
              <IoMenu />
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">Hi, {user.username}</span>
                <button 
                  onClick={logout} 
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleUserIconClick}
                className={`p-2 rounded-full hover:bg-gray-700 ${
                  showLogin ? 'bg-gray-700' : ''
                }`}
              >
                <FaRegUser className={`transition-transform ${
                  showLogin ? 'rotate-90' : ''
                }`} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '60px' }} />
    </div>
  );
};

export default Navbar;
