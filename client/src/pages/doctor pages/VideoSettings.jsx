// DoctorSettings.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../../config';
const API_URL = config.API_URL;

const DoctorSettings = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // useEffect(() => {
  //   // Fetch the current settings when component mounts
  //   axios
  //     .get("http://localhost:5000/api/doctor/getsettings", {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  //     })
  //     .then((response) => {
  //       setSelectedPlatform(response.data.videoPlatform);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching settings:", error);
  //       setError("Unable to fetch settings. Please try again.");
  //     });
  // }, []);

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setError(null);
    setSuccessMessage(null);
  };

  const updateSettings = () => {
    axios
      .put(
        `${API_URL}/api/doctor/updatesettings`, // Use PUT method for updating settings
        { videoPlatform: selectedPlatform },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      )
      .then((response) => {
        setSuccessMessage("Settings saved successfully!");
      })
      .catch((error) => {
        console.error("Error updating settings:", error.response ? error.response.data : error);
        // If error.response exists, it means the backend provided an error response
        if (error.response && error.response.data) {
          setError(error.response.data.error || "Failed to save settings. Please try again.");
        } else {
          setError("Failed to save settings. Please check your network or try again later.");
        }
      });
  };
  

  const handleSaveSettings = () => {
    if (!selectedPlatform) {
      setError("Please select a video platform.");
      return;
    }

    updateSettings(); // Save the selected platform to the backend

    // Redirect to the OAuth authorization endpoint for the selected platform
    if (selectedPlatform === "GoogleMeet") {
      window.location.href = "http://localhost:5000/google/authorize";
    } else if (selectedPlatform === "Zoom") {
      window.location.href = "http://localhost:5000/zoom/authorize";
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Choose Your Video Platform</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => handlePlatformChange("GoogleMeet")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300"
        >
          Google Meet
        </button>
        <button
          onClick={() => handlePlatformChange("Zoom")}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300"
        >
          Zoom
        </button>
      </div>
      {selectedPlatform && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Selected Platform: {selectedPlatform}</h2>
          <button
            onClick={handleSaveSettings}
            className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded shadow-md transition duration-300"
          >
            Save Settings
          </button>
        </div>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}
    </div>
  );
  
};

export default DoctorSettings;