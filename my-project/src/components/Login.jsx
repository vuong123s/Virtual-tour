import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../contexts/AuthContext"; // Correct the import path
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Ensure the base URL includes '/api'

const Login = ({ isPopupActive, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    rememberMe: false,
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      const { email, password } = JSON.parse(savedUser);
      setFormData(prev => ({ ...prev, email, password, rememberMe: true }));
    }
  }, []);

  const validateForm = (isRegister = false, fieldToValidate = null) => {
    const newErrors = {...errors};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = () => {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    };

    const validatePassword = () => {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
    };

    const validateUsername = () => {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else {
        delete newErrors.username;
      }
    };

    const validateTerms = () => {
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms';
      } else {
        delete newErrors.agreeTerms;
      }
    };

    if (fieldToValidate) {
      // Validate only specific field
      switch(fieldToValidate) {
        case 'email': validateEmail(); break;
        case 'password': validatePassword(); break;
        case 'username': validateUsername(); break;
        case 'agreeTerms': validateTerms(); break;
        default: break;
      }
    } else {
      // Validate all fields
      validateEmail();
      validatePassword();
      
      if (isRegister) {
        validateUsername();
        validateTerms();
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field in real-time
    if (touchedFields[name]) {
      validateForm(isActive, name);
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    validateForm(isActive, name);
  };

  const handleSuccessfulAuth = () => {
    onClose();
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { email, password } = formData;
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }); // Updated URL
      const { accessToken, ...user } = response.data;
      
      // Verify token before proceeding
      await login(user, accessToken);
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
      }
      
      toast.success('Login successful!');
      handleSuccessfulAuth();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed!';
      toast.error(errorMessage); // Display error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      const { accessToken, ...user } = response.data;
      
      // Verify token before proceeding
      await login(user, accessToken);
      
      toast.success('Registration successful!');
      handleSuccessfulAuth();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      
      // Clear invalid token if present
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex justify-center items-center fixed inset-0 ${
      isPopupActive ? 'bg-black/10' : 'pointer-events-none'
    } transition-all duration-700`}> 
      <div className={`relative w-96 h-[560px] bg-white/10 rounded-2xl shadow-lg transform transition-all duration-500 overflow-hidden ${
        isPopupActive ? 'scale-100' : 'scale-0'
      }`} style={{ opacity: 0.9 }}> 
        {/* Login Form */}
        <div className={`absolute w-full p-10 transition-transform duration-500 ${
          isActive ? "-translate-x-[120%]" : "translate-x-0"
        }`}>
          <h2 className="text-3xl text-center text-white mb-8">Login</h2>
          <form onSubmit={handleLogin}>
            <div className={`relative w-full h-12 border-b-2 ${
              errors.email ? 'border-red-500' : 'border-white/50'
            } my-8`}>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full h-full bg-transparent border-none outline-none text-white font-semibold pl-2 peer"
                required
              />
              <label className={`absolute left-2 top-1/2 -translate-y-1/2 text-white/70 
                transition-all duration-300 pointer-events-none
                peer-placeholder-shown:opacity-100
                ${formData.email ? 'opacity-0 -translate-y-3 text-sm' : ''}
                peer-focus:opacity-0 peer-focus:-translate-y-3 peer-focus:text-sm`}>
                Email
              </label>
              {errors.email && <span className="text-red-400 text-sm mt-1 block">{errors.email}</span>}
            </div>

            <div className={`relative w-full h-12 border-b-2 ${
              errors.password ? 'border-red-500' : 'border-white/50'
            } my-8`}>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full h-full bg-transparent border-none outline-none text-white font-semibold pl-2 peer"
                required
              />
              <label className={`absolute left-2 top-1/2 -translate-y-1/2 text-white/70 
                transition-all duration-300 pointer-events-none
                peer-placeholder-shown:opacity-100
                ${formData.password ? 'opacity-0 -translate-y-3 text-sm' : ''}
                peer-focus:opacity-0 peer-focus:-translate-y-3 peer-focus:text-sm`}>
                Password
              </label>
              {errors.password && <span className="text-red-400 text-sm mt-1 block">{errors.password}</span>}
            </div>

            <div className="flex items-center justify-between mb-6 text-white">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="mr-2 accent-blue-500"
                />
                Remember me
              </label>
              <button type="button" className="text-blue-400 hover:text-blue-300 text-sm">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Logging in...</span>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                'Login'
              )}
            </button>

            <div className="text-center mt-6 text-white/80">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className={`absolute w-full p-10 transition-transform duration-500 ${
          isActive ? "translate-x-0" : "translate-x-[120%]"
        }`}>
          <h2 className="text-3xl text-center text-white mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Create Account
            </span>
          </h2>
          <form onSubmit={handleRegister}>
            <div className={`relative w-full h-12 border-b-2 ${
              errors.username ? 'border-red-500' : 'border-white/50'
            } my-8`}>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full h-full bg-transparent border-none outline-none text-white font-semibold pl-2 peer"
                required
              />
              <label className={`absolute left-2 top-1/2 -translate-y-1/2 text-white/70 
                transition-all duration-300 pointer-events-none
                peer-placeholder-shown:opacity-100
                ${formData.username ? 'opacity-0 -translate-y-3 text-sm' : ''}
                peer-focus:opacity-0 peer-focus:-translate-y-3 peer-focus:text-sm`}>
                Username
              </label>
              {errors.username && <span className="text-red-400 text-sm mt-1 block">{errors.username}</span>}
            </div>

            <div className={`relative w-full h-12 border-b-2 ${
              errors.email ? 'border-red-500' : 'border-white/50'
            } my-8`}>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-full bg-transparent border-none outline-none text-white font-semibold pl-2 peer"
                required
              />
              <label className={`absolute left-2 top-1/2 -translate-y-1/2 text-white/70 
                transition-all duration-300 pointer-events-none
                peer-placeholder-shown:opacity-100
                ${formData.email ? 'opacity-0 -translate-y-3 text-sm' : ''}
                peer-focus:opacity-0 peer-focus:-translate-y-3 peer-focus:text-sm`}>
                Email
              </label>
              {errors.email && <span className="text-red-400 text-sm mt-1 block">{errors.email}</span>}
            </div>

            <div className={`relative w-full h-12 border-b-2 ${
              errors.password ? 'border-red-500' : 'border-white/50'
            } my-8`}>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full h-full bg-transparent border-none outline-none text-white font-semibold pl-2 peer"
                required
              />
              <label className={`absolute left-2 top-1/2 -translate-y-1/2 text-white/70 
                transition-all duration-300 pointer-events-none
                peer-placeholder-shown:opacity-100
                ${formData.password ? 'opacity-0 -translate-y-3 text-sm' : ''}
                peer-focus:opacity-0 peer-focus:-translate-y-3 peer-focus:text-sm`}>
                Password
              </label>
              {errors.password && <span className="text-red-400 text-sm mt-1 block">{errors.password}</span>}
            </div>

            <div className="my-6 text-white">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="mr-2 accent-purple-500 w-5 h-5"
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <a href="/terms" className="text-purple-300 hover:text-purple-400 underline">
                    terms & conditions
                  </a>
                </span>
              </label>
              {errors.agreeTerms && <span className="text-red-400 text-sm mt-1 block">{errors.agreeTerms}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Creating account...</span>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <span className="mr-2">🎉</span>
                  Get Started
                </>
              )}
            </button>

            <div className="text-center mt-6 text-white/80">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className="text-purple-300 hover:text-purple-400 font-semibold"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
