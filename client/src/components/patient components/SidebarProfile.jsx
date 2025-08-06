import React, { useEffect, useState } from "react";
import axios from "axios";
import defaultProfile from "/src/assets/images/patient images/doctor.jpeg";
import config from '../../config';
const API_URL = config.API_URL;

const SidebarProfile = () => {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          return;
        }

        const response = await axios.get(`${API_URL}/api/patient/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPatient(response.data);
      } catch (err) {
        console.error("Failed to fetch patient profile:", err);
        setError("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!patient) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

  const { name, age, gender, profilePhoto, _id } = patient;

  return (
    <div className="flex flex-col items-center space-y-2 mb-6 p-3">
      {/* Profile Image */}
      <div className="relative">
        <img
          src={profilePhoto || defaultProfile}
          alt="Profile"
          className="rounded-full w-28 h-28 object-cover border-4 border-white shadow-lg"
        />
      </div>

      {/* Name and Info */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">{name || "N/A"}</h2>
        {/* <p className="text-sm text-gray-600">Patient ID: {(_id || "").slice(-5).toUpperCase()}</p> */}
        <p className="text-sm text-gray-600">
          {gender || "Gender N/A"} : {age ? `${age} yrs` : "Age N/A"}
        </p>
      </div>
    </div>
  );
};

export default SidebarProfile;
