import React, { useEffect, useState } from 'react';

// Mock DoctorLayout component since it's not provided
const DoctorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

// MessengerSidebar Component
const MessengerSidebar = ({ patients, selectedPatientId, onPatientSelect, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Chats');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientCount = (filter) => {
    switch(filter) {
      case 'All Chats': return patients.length;
      case 'Bot Chats': return patients.filter(p => p.type === 'bot').length;
      case 'Your Chats': return patients.filter(p => p.type === 'doctor').length;
      default: return 0;
    }
  };

  return (
    <aside className="w-80 bg-white flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            className="w-full rounded-lg px-4 py-2 bg-gray-50 border-none text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        {['All Chats', 'Bot Chats', 'Your Chats'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-3 text-sm font-medium ${
              activeFilter === filter
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter} {getPatientCount(filter)}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="p-3 border-b border-gray-200">
        <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none">
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Most Active</option>
        </select>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">Loading patients...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center text-red-500">
              <div className="text-2xl mb-2">⚠️</div>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm">No patients found</p>
            </div>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedPatientId === patient.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onPatientSelect(patient)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {patient.name}
                    </h3>
                    <span className="text-xs text-gray-500">{patient.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">Patient ID: #{patient.patientId}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      patient.status === 'Online' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{patient.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        patient.consultation === 'Chronic' ? 'bg-orange-100 text-orange-600' :
                        patient.consultation === 'Acute' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {patient.consultation}
                      </span>
                      {patient.hasQuery && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center">
                          <span className="mr-1">💬</span>
                          Medical Query
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};