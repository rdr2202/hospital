import React, { useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DoctorNotification from "./DoctorNotification";
import DoctorMessenger from "./DoctorMessenger";
import homeologo from "/src/assets/images/doctor images/homeologo.png";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import config from "../../config";
const API_URL = config.API_URL;
const Header = () => {
  const navigate = useNavigate();
  const [isMessageActive, setIsMessageActive] = useState(false); // State to track active message button
  const [isNotifyActive, setIsNotifyActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);

  const [showNotification, setShowNotification] = useState(false); // For notification popup
  const [showMessenger, setShowMessenger] = useState(false); // For messenger popup

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0); // Timer in seconds for the current session
  const [intervalId, setIntervalId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00"); // Elapsed time from backend
  const [startTime, setStartTime] = useState(null);

const doctorId = localStorage.getItem("token"); // Fetch the logged-in doctor ID

useEffect(() => {
  if (!doctorId) return;

  // Retrieve stored state
  const storedIsCheckedIn = localStorage.getItem(`${doctorId}_isCheckedIn`) === "true";
  const storedStartTime = localStorage.getItem(`${doctorId}_startTime`);
  const storedPausedTime = parseInt(localStorage.getItem(`${doctorId}_pausedTimer`), 10) || 0;

  console.log("Loaded from localStorage:", {
    storedIsCheckedIn,
    storedStartTime,
    storedPausedTime,
  });

  if (storedIsCheckedIn) {
    const startTimestamp = Number(storedStartTime);

    setIsCheckedIn(true);
    setStartTime(startTimestamp);

    const newIntervalId = setInterval(() => {
      const now = Date.now();
      const secondsElapsed =
        Math.floor((now - startTimestamp) / 1000) + storedPausedTime; // Include paused time
      setTimer(secondsElapsed);
    }, 1000);

    setIntervalId(newIntervalId);
  } else if (storedPausedTime > 0) {
    setTimer(storedPausedTime); // Resume from paused time
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [doctorId]);


const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const handleCheckIn = async () => {
  if (!doctorId) {
    console.error("Doctor ID not found");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authentication token not found");
      return;
    }

    const pausedTime = parseInt(localStorage.getItem(`${doctorId}_pausedTimer`), 10) || 0;

    const response = await axios.post(
      `${API_URL}/api/attendance/checkin`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Backend response:", response.data);
  
    setIsCheckedIn(true);
    const startTimestamp = Date.now();
    setStartTime(startTimestamp);

    // Store state in localStorage
    localStorage.setItem(`${doctorId}_isCheckedIn`, "true");
    localStorage.setItem(`${doctorId}_startTime`, startTimestamp.toString());
    localStorage.setItem(`${doctorId}_timer`, pausedTime.toString());

    const newIntervalId = setInterval(() => {
      const now = Date.now();
      const secondsElapsed =
        Math.floor((now - startTimestamp) / 1000) + pausedTime; // Add paused time
      setTimer(secondsElapsed);
      localStorage.setItem(`${doctorId}_timer`, secondsElapsed.toString());
    }, 1000);

    setIntervalId(newIntervalId);
  } catch (error) {
    console.error("Error during check-in:", error);
  }
};

const handleCheckOut = async () => {
  if (!doctorId) {
    console.error("Doctor ID not found");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authentication token not found");
      return;
    }

    const response = await axios.post(
      `${API_URL}/api/attendance/checkout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { totalElapsedTime, breakTime } = response.data;

    const currentTimerValue = timer;
    localStorage.setItem(`${doctorId}_pausedTimer`, currentTimerValue.toString());

    setElapsedTime(totalElapsedTime); // Backend provides total time
    setIsCheckedIn(false);
    clearInterval(intervalId);
    setIntervalId(null);

    // Clear only the check-in state for this doctorId
    localStorage.removeItem(`${doctorId}_isCheckedIn`);
    localStorage.removeItem(`${doctorId}_startTime`);

    console.log("Break Time:", breakTime); // Display break time if needed
  } catch (error) {
    console.error("Error during check-out:", error);
  }
};

  
  const handleNotify = () => {
    setIsNotifyActive(!isNotifyActive);
    setShowNotification(!showNotification); // Toggle notification
    setShowMessenger(false); // Close messenger when notification is open
  };

  const handleProfile = () => {
    setIsProfileActive(!isProfileActive);
    navigate("/newprofile");
  };

  const handleMessage = () => {
    navigate("/docmessenger")
  };

  return (
    <div className="flex justify-between items-center px-5 py-3 fixed w-full top-0 bg-indigo-200 shadow-lg z-50">
      <div className="flex pt-1 ">
      <img src={homeologo} alt="Logo" className="w-20"/>
      <span className="ml-4 text-2xl font-bold text-gray-800">Consult Homeopathy</span>
      </div>
      <div className="flex items-center space-x-5">
      {/* <div className="bg-white border rounded-lg shadow-md w-full max-w-lg">  */}
      {/* <div className="flex items-center">
        <input
          type="text"
          placeholder="Search" 
          className="w-full p-3 rounded-l-full focus:outline-none focus:border-gray-500"
        />
        <button className="p-3 bg-white text-gray-500 rounded-r-lg hover:text-gray-700">
          <FaSearch />
        </button>
      </div> */}
    {/* </div> */}
    {!isCheckedIn ? (
  <button
    onClick={handleCheckIn}
    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600"
  >
    Check In
  </button>
) : (
  <div className="flex items-center gap-4">
    <p className="text-sm font-bold text-indigo-900">
      Total Working Hours:{" "}
      <span className="font-bold">{formatTime(timer)}</span>
    </p>
    <button
      onClick={handleCheckOut}
      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600"
    >
      Check Out
    </button>
  </div>
)}

        {/* Messenger Button */}
        <button onClick={handleMessage}>
          <div
            className={`shadow-lg rounded-full p-2 ${
              isMessageActive
                ? "bg-purple-400 text-white"
                : "bg-white text-purple-700 hover:text-white hover:bg-purple-400"
            }`}
          >
            <BiMessageRoundedDetail size={25} />
          </div>
        </button>

        {/* Notification Button */}
        <button onClick={handleNotify}>
          <div
            className={`shadow-lg rounded-full p-2 ${
              isNotifyActive
                ? "bg-blue-400 text-white"
                : "bg-white text-blue-600 hover:text-white hover:bg-blue-400"
            }`}
          >
            <MdOutlineNotificationsNone size={23} />
          </div>
        </button>

        {/* Profile Button */}
        <button onClick={handleProfile}>
          <div
            className={`shadow-lg rounded-full p-2 ${
              isProfileActive
                ? "bg-indigo-400 text-white"
                : "bg-white text-indigo-600 hover:text-white hover:bg-indigo-400"
            }`}
          >
            <CgProfile size={23} />
          </div>
        </button>
      </div>

      {/* Conditionally Render Messenger Popup */}
      {showMessenger && <DoctorMessenger toggleMessenger={handleMessage} isVisible={showMessenger}/>}

      {/* Conditionally Render Notification Popup */}
      {showNotification && <DoctorNotification togglePopup={handleNotify} />}
    </div>
  );
};

export default Header;
