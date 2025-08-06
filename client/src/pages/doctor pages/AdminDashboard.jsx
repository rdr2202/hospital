import React, { useState, useEffect } from 'react';
import {
  FaHome, FaChartLine, FaFileAlt, FaCog, FaUserMd, FaQuestionCircle,
  FaSignOutAlt, FaCalendarAlt, FaBell, FaUserCircle, FaBoxOpen, FaVideo,
  FaChevronLeft, FaChevronRight, FaBars, FaTruckLoading, FaCoins
} from 'react-icons/fa';
import MainContentComponent from '/src/components/calllog components/MainContentComponent.jsx';
import AddDoctor from './AddDoctor';
import Appointments from './Appointments';
import DashboardStatus from '../../components/calllog components/DashboardStatus';
import '/src/css/AdminDashboard.css';
import config from '../../config';
const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dashboardData, setDashboardData] = useState({
    totalCallsScheduled: 0,
    totalCallsCompleted: 0,
    callCompletionPercentage: 0,
    totalFollowUpCallsScheduled: 0,
    totalFollowUpCallsCompleted: 0,
    followUpCallCompletionPercentage: 0,
    totalQuieresCallsScheduled: 0,
    totalQuieresCallsCompleted: 0,
    quieresCallCompletionPercentage: 0,
    totalPaymentFollowUpsScheduled: 0,
    totalPaymentFollowUpsCompleted: 0,
    paymentFollowUpCompletionPercentage: 0,
    paymentFollowUpFCR: 0,
    paymentFollowUpConversion: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = config.API_URL;
  console.log("This is a testing" + localStorage.getItem("token"));
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    fetchDashboardData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    setActiveTab('all');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = today.toLocaleDateString('en-US', options);

  const renderMainContent = () => {
    switch (activeNav) {
      case 'home':
        return <MainContentComponent activeTab={activeTab} handleTabClick={handleTabClick} />;
      case 'add-doctor':
        return <AddDoctor />;
      case 'appointments':
        return <Appointments />;
      default:
        return <div className="default-content">Select an option from the sidebar</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* <div className={`bg-indigo-400 text-white w-30   min-h-screen ${isSidebarOpen ? '' : 'hidden'} md:block transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-md"></div>
            <span className="text-xl font-bold">Maars</span>
          </div>
          <nav className="space-y-2">
            {[
              { icon: FaUserMd, label: 'Add Doctor', link: 'add-doctor' },
              { icon: FaHome, label: 'Home', link: 'home' },
              { icon: FaVideo, label: 'Appointments', link: 'appointments' },
              { icon: FaFileAlt, label: 'Reports', link: 'reports' },
              { icon: FaBoxOpen, label: 'Inventory', link: 'inventory' },
              { icon: FaCog, label: 'Settings', link: 'settings' },
            ].map(({ icon: Icon, label, link }) => (
              <a
                key={link}
                href={`#${link}`}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-800 transition-colors duration-200 ${activeNav === link ? 'bg-pink-500' : ''}`}
                onClick={() => handleNavClick(link)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-4">
          {[
            { icon: FaQuestionCircle, label: 'Help', link: 'help' },
            { icon: FaSignOutAlt, label: 'Logout', link: 'logout' },
          ].map(({ icon: Icon, label, link }) => (
            <a
              key={link}
              href={`#${link}`}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-800 transition-colors duration-200"
              onClick={() => handleNavClick(link)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div> */}

      <div className="main-content">
        <div className="header">
          <button className="hamburger-menu" onClick={toggleSidebar}>
            <FaBars size={20} />
          </button>
          <div className="progress-container">
            <p className="date-container">
              <span className="calendar-icon">
                <FaCalendarAlt size={15} color="#000" />
              </span>
              {date}
            </p>
          </div>
          <div className="header-right">
            <span className="user-icon" onClick={() => window.location.href = '/inventory'}>
              <FaCoins size={20}/>
            </span>
            <span className="user-icon" onClick={() => window.location.href = '/vendors'}>
              <FaTruckLoading size={20}/>
            </span>
            <span className="notification-icon">
              <FaBell size={18} />
            </span>
            <span className="user-icon">
              <FaUserCircle size={20}/>
            </span>
          </div>
        </div>

        {/* <DashboardStatus dashboardData={dashboardData} /> */}

        {renderMainContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;