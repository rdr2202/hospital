import React, { useState, useEffect } from "react";
import config from '../../config';
const API_URL = config.API_URL;

const BreakTimer = () => {
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [breakDuration, setBreakDuration] = useState(0); // Break duration in minutes

  // Function to retrieve the token from local storage (or wherever it's stored)
  const getAuthToken = () => {
    return localStorage.getItem("token"); // Replace with your actual token retrieval method
  };

  const startBreak = (duration) => {
    setIsOnBreak(true);
    setShowOptions(false);
    setBreakDuration(duration);
    setTimer(duration * 60); // Convert minutes to seconds

    const token = getAuthToken();
    if (!token) {
      console.error("No token found, please log in");
      return; // Optionally handle this case with a redirect or message to the user
    }

    // Call the backend API to start the break
    fetch(`${API_URL}/api/work-hours/start-break`, {
      method: "POST",
      body: JSON.stringify({ duration }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
    }).then((response) => {
      if (!response.ok) {
        console.error("Failed to start break, Unauthorized.");
      }
    });
  };

  const endBreak = () => {
    setIsOnBreak(false);
    setTimer(0);

    const token = getAuthToken();
    if (!token) {
      console.error("No token found, please log in");
      return; // Optionally handle this case with a redirect or message to the user
    }

    // Call the backend API to end the break
    fetch(`${API_URL}/api/work-hours/end-break`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send token in Authorization header
      },
    }).then((response) => {
      if (!response.ok) {
        console.error("Failed to end break, Unauthorized.");
      }
    });
  };

  useEffect(() => {
    if (timer > 0 && isOnBreak) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown); // Clear the interval on unmount
    } else if (timer === 0 && isOnBreak) {
      // Auto-end the break when the timer reaches 0
      endBreak();
    }
  }, [timer, isOnBreak]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Break Timer</h1>
      {!isOnBreak ? (
        <div>
          {!showOptions ? (
            <div className="flex justify-center">
            <button
              onClick={() => setShowOptions(true)}
              className="w-1/4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Break
            </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
              <button
                onClick={() => startBreak(30)}
                className="w-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                30 Minutes
              </button>
              </div>
              <div className="flex justify-center">
              <button
                onClick={() => startBreak(60)}
                className="w-1/2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                1 Hour
              </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-4">Break Time Remaining:</p>
          <p className="text-4xl font-bold text-gray-900 mb-6">{formatTime(timer)}</p>
          <button
            onClick={endBreak}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            End Break
          </button>
        </div>
      )}
    </div>
  );
};

export default BreakTimer;
