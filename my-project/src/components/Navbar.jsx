import React from 'react';
import { FaRegUser } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext"; 
import { CiLogout } from "react-icons/ci";
import Logo1 from "../assets/logo1.png";


const Navbar = () => {
  const { user, logout } = useAuth(); 
  
  return (
    <div className="relative z-50">
      <div className="py-2 bg-white
       fixed top-0 left-0 right-0 border-b  transition-all duration-400 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="mr-auto">
            <Link to="/" className="flex items-center">
              <img className='h-6 mx-2 my-3' src = {Logo1} />
            </Link>
          </div>
          
        </div>
      </div>
      <div className="h-14" /> {/* Spacer for fixed navbar */}
    </div>
  );
};

export default Navbar;
