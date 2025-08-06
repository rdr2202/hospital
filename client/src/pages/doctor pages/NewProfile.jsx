// PatientProfile.js
import React, { useState, useEffect } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import axios from "axios";
import config from "../../config";
const API_URL = config.API_URL;

const PatientProfile = () => {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    whatsappNumber: "",
    gender: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/doctor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        age: res.data.age || "",
        phone: res.data.phone || "",
        whatsappNumber: res.data.whatsappNumber || "",
        gender: res.data.gender || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/api/doctor/updateProfile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Profile updated successfully!");
      setProfile(res.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const uploadProfilePhoto = async () => {
    try {
      const data = new FormData();
      data.append("profilePhoto", profilePhoto);

      await axios.post(
        `${API_URL}/api/doctor/uploadProfilePicture`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("📸 Profile picture updated!");
      fetchProfile();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="max-w-2/3 mx-auto w-full p-6 shadow bg-white rounded-lg">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
            <div className="flex-shrink-0 w-24 h-24 rounded-full border-3 border-gray-100 overflow-hidden bg-gray-200">
              {previewPhoto || profile.profilePhoto ? (
                <img
                  src={previewPhoto || profile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Photo
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 space-x-7">
              <label className="text-sm font-medium text-gray-700">
                Pick a photo from your files
              </label>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="file-upload"
                  disabled={!isEditing}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
                >
                  Add Photo
                </label>
                {profilePhoto && (
                  <button
                    onClick={uploadProfilePhoto}
                    className="ml-4 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>

            <div className="w-1/2 flex justify-end items-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 border-2 p-2 px-4 relative rounded-md text-white font-medium"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
            <InputField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <InputField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              type="number"
              disabled={!isEditing}
            />
            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
            <InputField
              label="WhatsApp Number"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <button
              onClick={handleProfileUpdate}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-200"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled,
}) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      disabled={disabled}
    />
  </div>
);

export default PatientProfile;
