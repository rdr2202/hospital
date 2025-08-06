import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from '/src/components/calllog components/LoginForm.jsx';
import config from '../../config';

const AdminLoginPage = () => {
  const [error, setError] = useState('');
  const API_URL = config.API_URL;

  const validatePhoneNumber = (phone) => {
    const regex = /^[0-9]{10}$/; // 10 digits only
    return regex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6; // minimum 6 characters
  };

  const handleLogin = async (phoneNumber, password) => {
    setError('');

    // Frontend validation
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Invalid phone number format. Must be 10 digits.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/log/login`, {
        phoneNumber,
        password,
      });

      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        window.location.href = '/admin-dashboard';
      } else {
        setError('Login failed. Token not received.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-sm text-center">
        <div className="mb-5">
          <i className="fas fa-user-shield text-6xl text-black"></i>
        </div>
        <h1 className="text-2xl font-bold mb-5">Admin Login</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default AdminLoginPage;
