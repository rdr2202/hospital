import React, { useState } from "react";
import SalaryStructure from "/src/pages/doctor pages/salarystructure.jsx";
import PayrollManagement from "/src/pages/doctor pages/payroll.jsx";
import Attendance from "/src/pages/doctor pages/AttendanceManagement.jsx";
import LeaveManagement from "/src/pages/doctor pages/AdminLeaveManagement.jsx";
import EmployeeProfile from "/src/pages/doctor pages/AssistDoc.jsx";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";

const HRPage = () => {
  const [activeTab, setActiveTab] = useState("employeeProfile");

  // Function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "employeeProfile":
        return <EmployeeProfile />;
      case "salaryStructure":
        return <SalaryStructure />;
      case "payrollManagement":
        return <PayrollManagement />;
      case "attendance":
        return <Attendance />;
      case "leaveManagement":
        return <LeaveManagement />;
      default:
        return <EmployeeProfile />;
    }
  };
  return (
    <DoctorLayout>
    <div className="min-h-screen p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">HR Management</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b-2 border-gray-300 pb-2">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "employeeProfile"
              ? "border-b-4 border-blue-500 text-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("employeeProfile")}
        >
          Employee Profile
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "salaryStructure"
              ? "border-b-4 border-blue-500 text-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("salaryStructure")}
        >
          Salary Structure
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "payrollManagement"
              ? "border-b-4 border-blue-500 text-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("payrollManagement")}
        >
          Payroll Management
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "attendance"
              ? "border-b-4 border-blue-500 text-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "leaveManagement"
              ? "border-b-4 border-blue-500 text-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("leaveManagement")}
        >
          Leave Management
        </button>
      </div>
      {/* Tab Content */}
      <div className="mt-4 p-6">
        {renderTabContent()}
      </div>
    </div>
    </DoctorLayout>
  );
};
export default HRPage;
