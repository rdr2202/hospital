import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBox,
  LuSettings,
  LuLayoutDashboard,
  LuWallet,
  LuCalendarCheck,
  LuCalendarPlus,
} from "react-icons/lu";
import { GiMedicines } from "react-icons/gi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { FaUserFriends } from "react-icons/fa";
import SidebarProfile from "./SidebarProfile"; // Import the Profile Component
import axios from "axios";
import config from "../../config";
const API_URL = config.API_URL;

const Sidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(null);
  const navigate = useNavigate();

  const handleRefer = () => {
    navigate("/refer");
  };
  const handleHelp = () => {
    navigate("/needhelp");
  };

  useEffect(() => {
    const activeIndex = SIDEBAR_LINKS.findIndex(
      (link) => link.path === location.pathname
    );
    setActiveLink(activeIndex);
  }, [location.pathname]);

  const SIDEBAR_LINKS = [
    {
      id: 1,
      path: "/consulthistory",
      name: "Consultation History",
      icon: LuBox,
    },
    {
      id: 2,
      path: "/home",
      name: "Home",
      icon: LuLayoutDashboard,
    },
    {
      id: 3,
      path: "/appointments/newappointment",
      name: "Book Appointment",
      icon: LuCalendarPlus,
    },
    {
      id: 4,
      path: "/appointments/upcoming",
      name: "Booked Appointments",
      icon: LuCalendarCheck,
    },
    {
      id: 5,
      path: "/payments",
      name: "Payments",
      icon: LuWallet,
    },
    {
      id: 6,
      path: "/medicine",
      name: "Medicine",
      icon: GiMedicines,
    },
    {
      id: 7,
      path: "/workshops",
      name: "Workshops",
      icon: MdOutlineOndemandVideo,
    },
    {
      id: 8,
      path: "/settings",
      name: "Settings",
      icon: LuSettings,
    },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem("token"); // Fetch token
    const handleLogout = async () => {
      const token = localStorage.getItem("token"); // Fetch token

      try {
        const response = await axios.post(
          "/api/otp/logout",
          {}, // no body
          {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token in header
            },
          }
        );

        if (response.data.success) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          console.error("Logout failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
    try {
      const response = await axios.post(
        `${API_URL}/api/otp/logout`,
        {}, // no body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token in header
          },
        }
      );

      if (response.data.success) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Logout failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-8 space-y-2">
      {/* Top Section: Profile and Links */}
      <div>
        {/* Profile Section */}
        <div className="bg-indigo-200 rounded-lg shadow-2xl">
          <SidebarProfile />
        </div>
        {/* Sidebar Links */}
        <ul className="space-y-4">
          {SIDEBAR_LINKS.map((link, index) => (
            <li
              key={index}
              className={`font-medium rounded-md py-2 px-5 hover:bg-indigo-200 hover:text-indigo-500 ${
                activeLink === index ? "bg-indigo-300 text-indigo-500" : ""
              }`}
            >
              <Link
                to={link.path}
                className="flex justify-center md:justify-start items-center space-x-5"
              >
                <span
                  className={`text-gray-800 text-2xl ${
                    activeLink === index ? "text-indigo-500" : ""
                  }`}
                >
                  {React.createElement(link.icon)}
                </span>
                <span className="text-md text-gray-600">{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section: Refer, Help, Logout */}
      <div className="flex flex-col items-center space-y-4 pt-6">
        <button
          onClick={handleRefer}
          className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-full"
        >
          <FaUserFriends className="text-sm" />
          <span>Refer Friend</span>
        </button>

        <button
          onClick={handleHelp}
          className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-full"
        >
          <span>?</span>
          <span>Need Help</span>
        </button>

        <button
          className="flex items-center justify-center space-x-2 text-xs text-white py-2 px-4 bg-red-500 hover:bg-red-600 rounded-full"
          onClick={handleLogout}
        >
          <CiLogout className="text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
