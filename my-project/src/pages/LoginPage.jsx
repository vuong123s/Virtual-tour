import React, { useState } from "react";
import Login from '../components/Login';
import loginBg from '../assets/login-bg3.jpg';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const LoginPage = () => {
  const [isPopupActive, setIsPopupActive] = useState(true);

  return (
    <div 
      className="min-h-screen flex justify-center items-center bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
    >
      <Login isPopupActive={isPopupActive} onClose={() => setIsPopupActive(false)} />
      <ToastContainer /> 
    </div>
  );
};

export default LoginPage;