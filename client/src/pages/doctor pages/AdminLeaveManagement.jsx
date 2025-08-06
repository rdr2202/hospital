import React, { useState, useEffect } from "react";
import axios from "axios";
import LeaveSettings from "/src/pages/doctor pages/LeaveSettingsForm.jsx"; // Assuming you have this component for settings
import config from '../../config';
const API_URL = config.API_URL;

function AdminLeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("leaveRequests"); // Tracks the active tab

  // Fetch all pending leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("token"); // Adjust based on how you're storing the token
        const response = await axios.get(`${API_URL}/api/leaves/pending`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to the request
          },
        });
        setLeaveRequests(response.data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/leaves/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Leave approved");
      setLeaveRequests(leaveRequests.filter((request) => request._id !== requestId));
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/leaves/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Leave rejected");
      setLeaveRequests(leaveRequests.filter((request) => request._id !== requestId));
    } catch (error) {
      console.error("Error rejecting leave:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 mt-2">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("leaveRequests")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "leaveRequests" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Leave Requests
        </button>
        <button
          onClick={() => setActiveTab("leaveSettings")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "leaveSettings" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Leave Settings
        </button>
      </div>

      {/* Conditional rendering of tab content */}
      {activeTab === "leaveRequests" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">Manage Leave Requests</h2>
          <ul className="space-y-4">
            {leaveRequests.length === 0 ? (
              <p className="text-gray-500">No pending leave requests</p>
            ) : (
              leaveRequests.map((request) => (
                <li
                  key={request._id}
                  className="p-4 bg-white rounded-lg shadow flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">
                      {request.name} requested{" "}
                      <span className="text-blue-600 text-sm">{request.leaveType}</span>
                    </p>
                    <p className="font-semibold text-sm text-gray-700">
                      Reason:{" "}
                      <span className="text-blue-600 text-sm">{request.reason}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      From {new Date(request.startDate).toLocaleDateString()} to{" "}
                      {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-sm text-gray-700">
                      Total Days:{" "}
                      <span className="text-blue-600 text-sm">{request.totalDays}</span>
                    </p>
                    <p className="text-sm font-semibold">
                      Status:{" "}
                      <span
                        className={`${
                          request.status === "pending"
                            ? "text-yellow-500"
                            : request.status === "approved"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {request.status}
                      </span>
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {activeTab === "leaveSettings" && <LeaveSettings />}
    </div>
  );
}

export default AdminLeaveManagement;
