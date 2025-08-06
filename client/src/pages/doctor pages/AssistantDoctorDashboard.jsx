import React, { useState, useEffect } from 'react';
import {
  FaHome, FaChartLine, FaFileAlt, FaCog, FaUserMd, FaQuestionCircle,
  FaSignOutAlt, FaCalendarAlt, FaBell, FaUserCircle, FaBoxOpen, FaVideo,
  FaChevronLeft, FaChevronRight, FaBars
} from 'react-icons/fa';
import AssistantMainCom from '/src/components/calllog components/AssistantMainCom.jsx';
import AddDoctor from './AddDoctor';
import Appointments from './Appointments';
import '/src/css/AdminDashboard.css';
import { useParams } from 'react-router-dom';

const AssistantDoctorDashboard = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { tabType } = useParams();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        return <AssistantMainCom activeTab={tabType || 'all'} handleTabClick={handleTabClick} />;
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
            <span className="notification-icon">
              <FaBell size={18} />
            </span>
            <span className="user-icon">
              <FaUserCircle size={20}/>
            </span>
          </div>
        </div>

        {renderMainContent()}
      </div>
    </div>
   
  );
};

export default AssistantDoctorDashboard;