import React, { useState } from "react";
import Layout from "../../components/patient components/Layout";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("password"); // Track active tab

  // States for change password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // States for notification settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [postNotifications, setpostNotifications] = useState(false);

  // Handle form submissions for password change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      // Add password change logic here (send to backend)
      alert("Password changed successfully!");
    } else {
      alert("New passwords do not match!");
    }
  };

  return (
    <div>
      <Layout> 
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Settings</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-300 mb-4">
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "notifications" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
              }`}
            >
              Notification Settings
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "password" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                    Old Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4 mt-10 flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Password
                </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2 mt-4">Notification Settings</h2>
              <div className="mb-4 flex items-center">
                <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 mt-2 text-sm font-medium text-gray-700">
                    Email Notifications
                </label>
                </div>

                <div className="mb-4 flex items-center">
                <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 mt-2 text-sm font-medium text-gray-700">
                    SMS Notifications
                </label>
                </div>

                <div className="mb-4 flex items-center">
                <input
                    type="checkbox"
                    checked={postNotifications}
                    onChange={(e) => setpostNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 mt-2 text-sm font-medium text-gray-700">
                     Posts/Videos
                </label>
                </div>


              <button
                className="bg-green-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => alert('Notification settings saved!')}
              >
                Save Notification Settings
              </button>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
};

export default Settings;
