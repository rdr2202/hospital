import React, { useState } from "react";
import ShiftDetails from "./ShiftDetails";
import AttendanceTracking from "./AttendanceTracking";
import AttendanceTab3 from "./AttendanceTab3.jsx";
import ShiftSettings from "./ShiftSettings.jsx";

function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState("shiftDetails");

  return (
    <div className="max-w-4xl mx-auto p-3 mt-2">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("shiftDetails")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "shiftDetails" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Shift Details
        </button>
        <button
          onClick={() => setActiveTab("shiftSettings")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "shiftSettings" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Shift Settings
        </button>
        <button
          onClick={() => setActiveTab("attendanceTracking")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "attendanceTracking" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Attendance Tracking
        </button>
        <button
          onClick={() => setActiveTab("leaveDetails")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "leaveDetails" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Holidays
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "shiftDetails" && <ShiftDetails />}
      {activeTab === "shiftSettings" && <ShiftSettings />}
      {activeTab === "attendanceTracking" && <AttendanceTracking />}
      {activeTab === "leaveDetails" && <AttendanceTab3 />}
    </div>
  );
}

export default AttendanceManagement;
