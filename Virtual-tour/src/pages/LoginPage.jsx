import React, { useState } from "react";
import Login from '../components/Login';
import loginBg from '../assets/login-bg.jpg'; 

const LoginPage = () => {
  const [isPopupActive, setIsPopupActive] = useState(true);

  return (
    <div 
      className="min-h-screen flex justify-center items-center bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
    >
      <Login isPopupActive={isPopupActive} onClose={() => setIsPopupActive(false)} />
    </div>
  );
};

export default LoginPage;