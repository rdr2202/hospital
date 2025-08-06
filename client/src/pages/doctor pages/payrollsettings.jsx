import React, { useState } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";

const HRPayrollModule = () => {
  const [formData, setFormData] = useState({
    employeeType: "",
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
   
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const employeeTypeDefaults = {
    Doctor: { baseSalary: 100000, allowances: 20000, deductions: 5000 },
    "Assistant Doctor": { baseSalary: 80000, allowances: 15000, deductions: 3000 },
    Admin: { baseSalary: 50000, allowances: 10000, deductions: 2000 },
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setFormData({
      ...formData,
      employeeType: selectedType,
      ...(employeeTypeDefaults[selectedType] || { baseSalary: 0, allowances: 0, deductions: 0 }),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // const token = localStorage.getItem('token'); // Assuming token is stored after login
      // if (!token) {
      //   setError('You are not authenticated. Please log in.');
      //   return;
      // }
      const response = await fetch("http://localhost:5000/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert(result.message);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving payroll settings:", error);
      alert("Failed to save payroll settings");
    }
  };
  

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-100 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6">Payroll Management</h2>

        {/* Payroll Form */}
        <form className="bg-white p-6 rounded-lg shadow">
          {/* Employee Type */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Employee Type</label>
            <select
              name="employeeType"
              value={formData.employeeType}
              onChange={handleTypeChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Employee Type</option>
              <option value="Doctor">Doctor</option>
              <option value="Assistant Doctor">Assistant Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Conditional Fields */}
          {formData.employeeType && (
            <>
              {/* Base Salary */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Base Salary</label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditMode}
                />
              </div>

              {/* Allowances */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Allowances</label>
                <input
                  type="number"
                  name="allowances"
                  value={formData.allowances}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditMode}
                />
              </div>

              {/* Deductions */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Deductions</label>
                <input
                  type="number"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isEditMode}
                />
              </div>
            </>
          )}

          

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={toggleEditMode}
              className={`${
                isEditMode ? "bg-gray-500" : "bg-yellow-500"
              } text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-80 transition`}
            >
              {isEditMode ? "Cancel Edit" : "Edit"}
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition"
            >
             Save setting
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
};

export default HRPayrollModule;
