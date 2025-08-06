import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LuBox, LuCalendar, LuWallet, LuSettings, LuChevronDown, LuChevronRight } from "react-icons/lu";
import { MdOutlineOndemandVideo, MdOutlineDashboardCustomize } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { FaUserFriends, FaStethoscope } from "react-icons/fa";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { MdAccountBalance } from "react-icons/md";
import { FaPhotoVideo } from "react-icons/fa";
import { FaUserDoctor, FaPeopleGroup } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

import SidebarProfile from "./DoctorSidebarProfile";
import axios from 'axios';
import config from '../../config';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  
  // State management
  const [expandedItems, setExpandedItems] = useState({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [doctorRole, setDoctorRole] = useState(null);
  const [visibleLinks, setVisibleLinks] = useState([]);
  
  // Define sidebar links based on role
  const SIDEBAR_LINKS = role === "admin-doctor" ? [
    { id: 1, path: "/dashboard", name: "Home", icon: LuBox },
    {
      id: 2,
      name: "Appointments",
      icon: LuCalendar,
      sublinks: [
        { id: 21, path: "/appointments/calender", name: "Calendar" },
        { id: 22, path: "/appointments/list", name: "Appointment List" },
      ],
    },
    {
      id: 3,
      name: "Patients",
      icon: FaUserFriends,
      sublinks: [
        { id: 31, path: "/patients", name: "Patient List" },
        { id: 32, path: "/patients/card", name: "Patient Cards" },
      ],
    },
   {
      id: 4,
      name: "Doctors",
      icon: FaStethoscope,
      sublinks: [
        { id: 41, path: "/assistdoc", name: "Assistant Doctors" },
        { id: 42, path: "/assistdoc/docprofile", name: "Doctor Profiles" },
        { id: 43, path: "/assistdoc/doctors", name: "External Doctors" },
      ],
    },
    { id: 5, path: "/docpayments", name: "Payments", icon: LuWallet },
    { id: 6, path: "/raw-materials", name: "Inventory", icon: AiOutlineMedicineBox },
    { id: 7, path: "/workshoppage", name: "Workshops", icon: MdOutlineOndemandVideo },
    { id: 8, path: "/content", name: "Content", icon: FaPhotoVideo },
    { id: 9, path: "/accounts", name: "Accounts", icon: MdAccountBalance },
    { id: 10, path: "/doctor-dashboard/all", name: "Doctor CRM", icon: FaUserDoctor },
    { id: 11, path: "/allocation", name: "Doctor Allocation", icon: MdOutlineDashboardCustomize },
    { id: 12, path: "/docsettings", name: "Settings", icon: LuSettings },
    { id: 13, path: "/hrm", name: "HR Management", icon: FaPeopleGroup },
  ] : role === "assistant-doctor" ? [
    { id: 1, path: "/dashboard", name: "Home", icon: LuBox },
    {
      id: 2,
      name: "Appointments",
      icon: LuCalendar,
      sublinks: [
        { id: 21, path: "/appointments/calender", name: "Calendar" },
        { id: 22, path: "/appointments/list", name: "Appointment List" },
      ],
    },
    { id: 3, path: "/docpayments", name: "Payments", icon: LuWallet },
    { id: 4, path: "/inventory", name: "Inventory", icon: AiOutlineMedicineBox },
    { id: 5, path: "/content", name: "Content", icon: FaPhotoVideo },
    { id: 6, path: "/doctor-dashboard", name: "Doctor CRM", icon: FaUserDoctor },
    { id: 7, path: "/assistleave", name: "Leave", icon: FaUserDoctor },
    { id: 8, path: "/docsettings", name: "Settings", icon: LuSettings },
  ] : [];

  // Initialize expanded items based on current path
  useEffect(() => {
    // Find which parent menu should be expanded based on current path
    SIDEBAR_LINKS.forEach(link => {
      if (link.sublinks) {
        const sublink = link.sublinks.find(sub => sub.path === location.pathname);
        if (sublink) {
          setExpandedItems(prev => ({ ...prev, [link.id]: true }));
        }
      }
    });
  }, []);

  // Check if a link or its sublinks are active
  const isLinkActive = (link) => {
    if (link.path === location.pathname) return true;
    
    if (link.sublinks) {
      return link.sublinks.some(sublink => sublink.path === location.pathname);
    }
    
    return false;
  };

  // Check if a specific sublink is active
  const isSubLinkActive = (path) => {
    return path === location.pathname;
  };

  // Toggle submenu expansion
  const toggleSubMenu = (e, linkId) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [linkId]: !prev[linkId]
    }));
  };

  // Handle navigation for links
  const handleLinkClick = (e, link) => {
    if (link.sublinks) {
      toggleSubMenu(e, link.id);
    } else {
      navigate(link.path);
      if (window.innerWidth < 768) {
        setIsMobileSidebarOpen(false);
      }
    }
  };

  // Handle logout with improved user feedback
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      if (token) {
        // Call the check-out endpoint
        await axios.post(
          `${API_URL}/api/work-hours/check-out`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 5000 // Set timeout to prevent hanging logout
          }
        );
        await axios.post(
        `${API_URL}/api/otp/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      }

      // Clear the session and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Small delay for better UX
      setTimeout(() => {
        window.location.href = '/login'; // Redirect to the login page
      }, 500);
      
    } catch (err) {
      console.error('Failed to record clock-out:', err);
      setLogoutError('Logout process encountered an issue. Redirecting...');
      
      // Still logout even if clock-out fails
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  // Animation variants for menu items
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileSidebar}
          className="bg-indigo-500 text-white p-2 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main sidebar */}
      <motion.div 
        className={`h-screen flex flex-col justify-between p-4 md:p-8 fixed top-0 left-0 w-64 bg-indigo-50 shadow-lg z-40
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        initial={false}
        animate={{ x: isMobileSidebarOpen || window.innerWidth >= 768 ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Profile section */}
        <div className="mb-4">
          <SidebarProfile />
        </div>
        
        {/* Navigation links */}
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
          <ul className="space-y-1">
            {SIDEBAR_LINKS.map((link) => (
              <li key={link.id} className="mb-1">
                <div 
                  className={`w-full cursor-pointer rounded-md transition-all duration-200 ${
                    isLinkActive(link) 
                      ? "bg-indigo-200 text-indigo-700 font-medium shadow-sm" 
                      : "hover:bg-indigo-100 text-gray-600"
                  }`}
                >
                  <div 
                    className="flex items-center justify-between py-3 px-4"
                    onClick={(e) => handleLinkClick(e, link)}
                  >
                    <div className="flex items-center">
                      <span className={`text-xl mr-3 ${isLinkActive(link) ? "text-indigo-600" : "text-gray-500"}`}>
                        {React.createElement(link.icon)}
                      </span>
                      <span className={`${isLinkActive(link) ? "text-indigo-700" : "text-gray-600"}`}>
                        {link.name}
                      </span>
                    </div>
                    
                    {link.sublinks && (
                      <button 
                        onClick={(e) => toggleSubMenu(e, link.id)}
                        className={`p-1 rounded-full hover:bg-indigo-200 ${isLinkActive(link) ? "text-indigo-700" : "text-gray-500"}`}
                        aria-label={expandedItems[link.id] ? "Collapse menu" : "Expand menu"}
                      >
                        {expandedItems[link.id] ? <LuChevronDown size={16} /> : <LuChevronRight size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Submenu items with animation */}
                <AnimatePresence>
                  {expandedItems[link.id] && link.sublinks && (
                    <motion.ul
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        closed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden pl-8 mt-1"
                    >
                      {link.sublinks.map((sublink) => (
                        <motion.li
                          key={sublink.id}
                          variants={itemVariants}
                          className={`py-2 px-3 my-1 rounded-md transition-colors duration-150 ${
                            isSubLinkActive(sublink.path)
                              ? "bg-indigo-100 text-indigo-700 font-medium"
                              : "hover:bg-indigo-50 text-gray-500"
                          }`}
                        >
                          <Link 
                            to={sublink.path} 
                            className="flex items-center w-full"
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                setIsMobileSidebarOpen(false);
                              }
                            }}
                          >
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                            <span>{sublink.name}</span>
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>

        {/* Help and logout section */}
        <div className="flex flex-col items-center space-y-3 pt-4 mt-2 border-t border-indigo-100">
          {logoutError && (
            <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-md w-full">
              {logoutError}
            </div>
          )}
          
          <button
            onClick={() => navigate("/needhelp")}
            className="flex items-center justify-center w-full space-x-2 text-sm text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <LuChevronRight className="text-sm" />
            <span>Need Help</span>
          </button>

          <button
            className={`flex items-center justify-center w-full space-x-2 text-sm text-white py-2 px-4 ${
              isLoggingOut ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
            } rounded-lg transition-colors duration-200 shadow-sm`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <CiLogout className="text-sm" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;