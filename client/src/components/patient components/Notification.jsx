import React, { useState } from "react";
import { FaPills, FaBell, FaClipboard, FaUsers } from "react-icons/fa";

const Notification = ({ togglePopup }) => {
  // Notification data
  const [notifications] = useState([
    { id: 1, type: "medicine", message: "Patient John missed taking medicine.", icon: FaPills, time: "2 mins ago" },
    { id: 2, type: "assistant", message: "Assistant Dr.Smith prepared medicines.", icon: FaClipboard, time: "10 mins ago" },
    { id: 3, type: "inventory", message: "Low inventory alert: Ibuprofen stock is low.", icon: FaPills, time: "1 hour ago" },
    { id: 4, type: "education", message: "Workshop on Healthy Lifestyle is going to held on 25 Aug", icon: FaUsers, time: "2 hours ago" },
    { id: 5, type: "meeting", message: "Meeting with patient Doe in 15 minutes.", icon: FaBell, time: "3 hours ago" },
    { id: 6, type: "medicine", message: "Patient John missed taking medicine.", icon: FaPills, time: "2 mins ago" },
    { id: 7, type: "assistant", message: "Assistant Dr.Smith prepared medicines.", icon: FaClipboard, time: "10 mins ago" },
    { id: 8, type: "inventory", message: "Low inventory alert: Ibuprofen stock is low.", icon: FaPills, time: "1 hour ago" },
    { id: 9, type: "education", message: "Education session 'Patient Care' starts in 30 minutes.", icon: FaUsers, time: "2 hours ago" },
    { id: 10, type: "meeting", message: "Meeting with patient Doe in 15 minutes.", icon: FaBell, time: "3 hours ago" },
  ]);

  // Define icon colors for each notification type
  const iconColors = {
    medicine: "text-green-500", // Red color for medicine notifications
    assistant: "text-purple-500", // Green color for assistant-related notifications
    inventory: "text-red-500", // Yellow color for inventory notifications
    education: "text-violet-500", // Purple color for education session notifications
    meeting: "text-blue-500", // Blue color for meeting notifications
  };

  return (
    <div className="fixed top-12 right-5 w-1/7 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      <div className="p-4 bg-blue-400 text-white">
        <h3 className="text-lg font-bold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto p-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center border-b py-2"
          >
            {/* Apply the icon with dynamic color */}
            <span className={`text-xl mr-3 ${iconColors[notification.type]}`}>
              {React.createElement(notification.icon)}
            </span>
            <div>
              <p className="text-sm font-semibold">{notification.message}</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="w-full p-2 bg-blue-100 text-blue-500 hover:bg-blue-200"
        onClick={togglePopup}
      >
        Close
      </button>
    </div>
  );
};

export default Notification;
