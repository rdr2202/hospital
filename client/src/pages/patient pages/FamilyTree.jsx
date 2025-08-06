import React, { useState } from "react";
import axios from "axios";
import config from "../../config";
const API_URL = config.API_URL;

const AddFamilyMember = () => {
  const [formData, setFormData] = useState({
    IndividulAccess: false,
    relationship: "",
    familyMemberName: "",
    familyMemberPhone: "",
    name: "",
    age: "",
    phone: "",
    email: "",
    diseaseName: "",
    diseaseType: "",
    country: "",
    state: "",
    city: "",
    dob: "",
    weight: "",
    height: "",
    occupation: "",
    complaint: "",
    symptoms: "",
    associatedDisease: "",
    allopathy: "",
    diseaseHistory: "",
    surgeryHistory: "",
    allergies: "",
    bodyType: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token"); // If you have token-based auth
      const response = await axios.post(
        `${API_URL}/api/patient/addFamily`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message || "Family member added successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again!"
      );
    }
  };

  const familyRelationships = [
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Father in law",
    "Mother in law",
    "Husband",
    "Wife",
  ];

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add Family Member</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Checkbox for Individual Access */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="IndividulAccess"
            checked={formData.IndividulAccess}
            onChange={handleChange}
          />
          <label htmlFor="IndividulAccess">Individual Access</label>
        </div>

        {/* Relationship Selection */}
        <div>
          <label className="block mb-1">Relationship</label>
          <select
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select Relationship</option>
            {familyRelationships.map((relation) => (
              <option key={relation} value={relation}>
                {relation}
              </option>
            ))}
          </select>
        </div>

        {/* If Individual Access, show minimal fields */}
        {formData.IndividulAccess ? (
          <>
            <div>
              <label className="block mb-1">Family Member Name</label>
              <input
                type="text"
                name="familyMemberName"
                value={formData.familyMemberName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Family Member Phone</label>
              <input
                type="text"
                name="familyMemberPhone"
                value={formData.familyMemberPhone}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </>
        ) : (
          <>
            {/* If NOT Individual Access, show complete patient form */}
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Disease Name</label>
              <input
                type="text"
                name="diseaseName"
                value={formData.diseaseName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Disease Type</label>
              <input
                type="text"
                name="diseaseType"
                value={formData.diseaseType}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            {/* Optional fields */}
            <div>
              <label className="block mb-1">DOB</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Add more fields here like weight, height, complaint, etc., if needed */}
          </>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-4"
        >
          Add Family Member
        </button>
      </form>
    </div>
  );
};

export default AddFamilyMember;
