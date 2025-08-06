import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(phoneNumber, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          placeholder="Phone number*"
          className="w-4/5 h-12 p-3 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password*"
          className="w-4/5 h-12 p-3 border border-gray-300 rounded-lg"
        />
      </div>
      <button
        type="submit"
        className="w-4/5 h-12 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
