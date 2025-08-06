import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Notification from "./Notification";
import Messenger from "./Messenger";
import homeologo from "/src/assets/images/patient images/homeologo.png";

const Header = () => {
  const navigate = useNavigate();
  const [isMessageActive, setIsMessageActive] = useState(false);
  const [isNotifyActive, setIsNotifyActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const handleNotify = () => {
    setIsNotifyActive(!isNotifyActive);
    setShowNotification(!showNotification);
    setShowMessenger(false);
  };

  const handleProfile = () => {
    setIsProfileActive(!isProfileActive);
    navigate("/profile");
  };

  const handleMessage = () => {
    navigate("/messenger");
  };


  const name = "Rita";

  return (
    <div className="flex justify-between items-center px-5 py-3 fixed w-full top-0 bg-indigo-200 shadow-lg z-50">
      <div className="flex pt-1 ">
        <img src={homeologo} alt="Logo" className="w-20" />
        <span className="ml-4 text-2xl font-bold text-gray-800 custom-font">Consult Homeopathy</span>
      </div>
      <div className="flex items-center space-x-5">
        <button onClick={handleMessage}>
          <div className={`shadow-lg rounded-full p-2 ${isMessageActive ? "bg-purple-400 text-white" : "bg-white text-purple-700 hover:text-white hover:bg-purple-400"}`}>
            <BiMessageRoundedDetail size={25} />
          </div>
        </button>
        <button onClick={handleNotify}>
          <div className={`shadow-lg rounded-full p-2 ${isNotifyActive ? "bg-blue-400 text-white" : "bg-white text-blue-600 hover:text-white hover:bg-blue-400"}`}>
            <MdOutlineNotificationsNone size={23} />
          </div>
        </button>
        <button onClick={handleProfile}>
          <div className={`shadow-lg rounded-full p-2 ${isProfileActive ? "bg-indigo-400 text-white" : "bg-white text-indigo-600 hover:text-white hover:bg-indigo-400"}`}>
            <CgProfile size={23} />
          </div>
        </button>
      </div>

      {showMessenger && <Messenger toggleMessenger={handleMessage} isVisible={showMessenger} />}
      {showNotification && <Notification togglePopup={handleNotify} />}
    </div>
  );
};

export default Header;
