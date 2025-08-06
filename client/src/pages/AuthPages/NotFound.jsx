import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-2xl text-center bg-white rounded-lg shadow-md p-8">
        <img 
          src="/logo.png" 
          alt="Consult Homeopathy Logo" 
          className="h-12 mx-auto mb-6"
        />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        
        <div className="flex justify-center mb-6">
          <div className="text-6xl text-purple-400 font-bold">404</div>
        </div>
        
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;