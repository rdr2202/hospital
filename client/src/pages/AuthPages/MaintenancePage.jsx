import React from 'react';

const Maintenance = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-2xl text-center bg-white rounded-lg shadow-md p-8">
        <img 
          src="/logo.png" 
          alt="Consult Homeopathy Logo" 
          className="h-12 mx-auto mb-6"
        />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Scheduled Maintenance</h1>
        
        <div className="flex justify-center mb-6">
          <svg className="w-24 h-24 text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </div>
        
        <p className="text-gray-600 mb-4">
          Our system is currently undergoing scheduled maintenance to improve your experience.
        </p>
        
        <p className="text-gray-600 mb-8">
          We expect to be back online at <span className="font-semibold">April 16, 2025, 3:00 AM EST</span>.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-md mb-8">
          <p className="text-sm text-gray-600">
            For urgent matters, please contact us at <a href="mailto:support@consulthomeopathy.com" className="text-blue-500 hover:underline">support@consulthomeopathy.com</a>
          </p>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
        >
          Check Status
        </button>
      </div>
    </div>
  );
};

export default Maintenance;