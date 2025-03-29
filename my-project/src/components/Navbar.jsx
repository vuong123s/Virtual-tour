import React, { useState, useEffect } from 'react';
import { FaMap } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { Link } from 'react-router-dom';
import Logo1 from '../assets/logo.png';
import { useAuth } from "../contexts/AuthContext"; 

const Navbar = () => {
  const { user, logout } = useAuth(); 
  
  return (
    <div className="relative z-50">
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
              <Link to="/login" className="p-2 rounded-full hover:bg-gray-700">
                <FaRegUser />
              </Link>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '60px' }} />
    </div>
  );
};

export default Navbar;
