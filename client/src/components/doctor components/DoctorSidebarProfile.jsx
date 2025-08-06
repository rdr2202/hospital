import React, { useEffect, useState } from "react";
import axios from "axios";
import defaultDoctorImage from "/src/assets/images/doctor images/doc.jpg";
import config from "../../config";
const API_URL = config.API_URL;

const SidebarProfile = () => {
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    profilePhoto: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctorDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError("Unable to fetch doctor details");
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <img
          src={doctorDetails.profilePhoto || defaultDoctorImage}
          alt="Doctor Profile"
          className="rounded-full w-24 h-24 mt-5 object-cover border-4 border-white shadow-lg"
        />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">{doctorDetails.name}</h2>
      </div>
    </div>
  );
};

export default SidebarProfile;
