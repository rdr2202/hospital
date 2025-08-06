import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientsTable from './PatientsTable';
import WorkTable from './WorkTable';
import StatusCompleteTable from './StatusCompleted';
import InProgressTable from './InProgressTable';
import LostTable from './LostTable';
import AttemptBucket from './AttemptBucket';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import config from '../../config';

const AssistantMainCom = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    chronicPatients: 0,
    acutePatients: 0,
    newPatientsToday: 0,
    pendingCallsFromApp: 0,
    pendingMedicalRecords: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const API_URL = config.API_URL;

  const { tabType } = useParams();
  const navigate = useNavigate();

  const defaultTab = 'all';
  const activeTab = tabType || defaultTab;

  const handleTabClick = (tab) => {
    navigate(`/doctor-dashboard/${tab}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/log/dashboard`);
        setDashboardData(response.data);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch dashboard data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderPatientsTable = () => {
    switch (activeTab) {
      case 'all':
        return <PatientsTable />;
      case 'myAllocation':
        return <WorkTable />;
      case 'lost':
        return <LostTable />;
      case 'attemptBucket':
        return <AttemptBucket />;
      default:
        return <div className="p-4 text-center text-gray-500">No data available</div>;
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-300"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="main-content bg-gray-50 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Status</h2>
      
      {/* Status Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center bg-indigo-400 text-white p-3 rounded-lg">
          <FaCalendarAlt size={18} className="mr-2" />
          <span className="font-semibold">Today</span>
        </div>
        {Object.entries({
          'Total Patients': dashboardData.totalPatients,
          'Patients Registered Today': dashboardData.newPatientsToday,
          'Call Not Made Yet': dashboardData.pendingCallsFromApp,
          'Pending Medical Records': dashboardData.pendingMedicalRecords
        }).map(([title, value]) => (
          <div key={title} className="flex flex-col items-center justify-center p-4 border-l last:border-none">
            <span className="text-sm text-gray-500">{title}</span>
            <span className="text-2xl font-bold text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        {/* Mobile View - Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={toggleDropdown}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
          >
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            <FaChevronDown className={`ml-2 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
              {['all', 'myAllocation', 'lost', 'attemptBucket'].map((tab) => (
                <a
                  key={tab}
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(tab);
                    toggleDropdown();
                  }}
                >
                  {tab === 'all' ? 'All'
                    : tab === 'myAllocation' ? 'My Allocation'
                    : tab === 'lost' ? 'Lost'
                    : 'Attempt Bucket'}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View - Tabs */}
        <div className="hidden md:flex space-x-2 bg-gray-200 p-2 rounded-lg shadow">
          {['all', 'myAllocation', 'lost', 'attemptBucket'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 py-3 px-6 text-sm font-medium rounded-md text-center transition-colors duration-300 ${
                activeTab === tab
                  ? 'bg-indigo-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow'
              }`}
            >
              {tab === 'all' ? 'All'
                : tab === 'myAllocation' ? 'My Allocation'
                : tab === 'lost' ? 'Lost'
                : 'Attempt Bucket'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderPatientsTable()}
      </div>
    </div>
  );
};

export default AssistantMainCom;
