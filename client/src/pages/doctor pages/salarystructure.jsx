import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEllipsisV, FaEye } from "react-icons/fa";

const SalaryStructure = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [selectedDoctor,setSelectedDoctor]=useState();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({ query: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [formData, setFormData] = useState({
    employeeID: "", 
    name: "",
    baseSalary: "",
    allowances: [],
    deductions: [
      { name: "PF", value: "" },
      { name: "Gratuity", value: "" },
      { name: "Professional Tax", value: "" },
    ],
    kpi: [], // Added KPI as an array (since it has multiple name & amount fields)
    leaveEncashment: "No",
    totalAllowances: "",
    totalDeductions: "", // Array for deductions
    grossSalary: "",
    netSalary: "",
  });

  useEffect(() => {
    fetchSalaryData();
  }, []);
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
        ...prevFilter,          
        [name]: value,
    }));
    setCurrentPage(1);
};

// Handle entries per page change
const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
};

// Filtered and paginated doctors
const filteredDoctors = salaryData.filter((doctor) =>
    ["employeeID","name"].some((field) =>
        doctor[field]?.toLowerCase().includes(filter.query.toLowerCase())
    )
);
const indexOfLastEntry = currentPage * entriesPerPage;
const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
const currentDoctors = filteredDoctors.slice(indexOfFirstEntry, indexOfLastEntry);
const totalPages = Math.ceil(filteredDoctors.length / entriesPerPage);

// Handle pagination
const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchSalaryData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/salary/fetch"); // Adjust the URL accordingly
      setSalaryData(response.data);
    } catch (error) {
      console.error("Error fetching salary data", error);
    }
  };

  const toggleDropdown = (employeeID) => {
    setDropdownVisible(dropdownVisible === employeeID ? null : employeeID);
  };
  // Close dropdown if clicked outside
      useEffect(() => {
          const handleClickOutside = (event) => {
          if (
              dropdownRef.current &&
              !dropdownRef.current.contains(event.target) &&
              !buttonRef.current.contains(event.target)
          ) {
              setDropdownVisible(null);
          }
          };
  
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          };
      }, []);
  
      // Close dropdown when an option is clicked
      const handleOptionClick = () => {
          setDropdownVisible(null); // Close the dropdown when any option is clicked
      };
  useEffect(() => {
    const baseSalary = Number(formData.baseSalary) || 0;
    const totalAllowances = (formData.allowances || []).reduce(
      (sum, item) => sum + Number(item.value || 0),
      0
    );

    const totalDeductions = (formData.deductions || [])
      .filter((item) => item.name.toLowerCase() !== "gratuity") // Exclude "Gratuity"
      .reduce(
        (sum, item) => sum + (baseSalary * (parseFloat(item.value) || 0)) / 100,
        0
      );

    const grossSalary = baseSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    setFormData((prev) => ({
      ...prev,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
    }));
  }, [formData.baseSalary, formData.allowances, formData.deductions]);

  // Handle Input Change
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Add Allowance or Deduction Field
  const addField = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type] ? [...prev[type], { name: "", value: "" }] : [{ name: "", value: "" }],
    }));
  };
  
  // Update Allowance or Deduction Value
  const updateField = (type, index, field, value) => {
    const updatedFields = [...formData[type]];
    updatedFields[index][field] = value;
    setFormData((prev) => ({ ...prev, [type]: updatedFields }));
  };

  // Remove Field
  const removeField = (type, index) => {
    const updatedFields = [...formData[type]];
    updatedFields.splice(index, 1);
    setFormData((prev) => ({ ...prev, [type]: updatedFields }));
  };

  // Submit Form Data (Save or Update)
  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/salary/update/${formData.employeeID}`, formData); // Update API call
        alert("Salary structure updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/salary/save", formData); // Save new data
        alert("Salary structure saved successfully!");
      }
      setIsModalOpen(false);
      setIsEditing(false);
      // Reset Form Data
      setFormData({
        employeeID: "",
        name: "",
        baseSalary: "",
        allowances: [],
        deductions: [
          { name: "PF", value: "" },
          { name: "Gratuity", value: "" },
          { name: "Professional Tax", value: "" },
        ],
        kpi: [], // Stores KPI bonuses
        leaveEncashment: "", // Stores Yes/No
        totalAllowances: 0,
        totalDeductions: 0,
        grossSalary: 0,
        netSalary: 0,
      });
      fetchSalaryData(); // Refresh salary data
    } catch (error) {
      console.error("Error saving or updating salary structure:", error);
      alert("Failed to save or update salary structure.");
    }
  };

  const fetchDoctorById = async (employeeID) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/salary/retrive/${employeeID}`);
      const salaryData = response.data; // Extract data from the response
  
      if (!salaryData || !salaryData.employeeID) {
        throw new Error("Invalid doctor data");
      }
  
      setSelectedDoctor(salaryData); // Pre-fill modal with fetched data
      setIsModalOpen(true);
      setFormData({
        employeeID: salaryData.employeeID,
        name: salaryData.name,
        baseSalary: salaryData.baseSalary,
        allowances:salaryData.allowances || [{ name: "", value: "" }],
        deductions: salaryData.deductions || [{ name: "", value: "" }],
        totalAllowances:salaryData.totalAllowances,
        totalDeductions:salaryData.totalDeductions,
        grossSalary: salaryData.grossSalary,
        netSalary: salaryData.netSalary
      }); // Open the modal
    } catch (error) {
      console.error("Error fetching doctor by ID:", error);
      alert("Failed to fetch doctor details.");
    }
  };
  
  const handleEditDoctor = (employeeID) => {
    setSelectedDoctor(null);  // Clear the previous selected doctor in case of modal reuse
    fetchDoctorById(employeeID);
};

  const handleDeleteSalary = async (employeeID) => {
    try {
      await axios.delete(`http://localhost:5000/api/salary/delete/${employeeID}`);
      alert("Salary structure deleted successfully!");
      fetchSalaryData(); // Refresh salary data after delete
    } catch (error) {
      console.error("Error deleting salary structure:", error);
      alert("Failed to delete salary structure.");
    }
  };

  return (
    <div>
      <div className="p-2">
      <div className="flex justify-between mb-6">
                    <input
                        type="text"
                        name="query"
                        placeholder="Search by ID"
                        value={filter.query}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    />
                    {/* <button
                        onClick={() => alert("Exporting doctors' data...")}
                        className="bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition-all flex items-center"
                    >
                        <FaFileExport className="mr-2" />
                        Export
                    </button> */}
                </div>

      {/* Salary Table */}
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2">Employee ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Base Salary</th>
                  <th className="px-4 py-2">Total Allowance</th>
                  <th className="px-4 py-2">Total Deduction</th>
                  <th className="px-4 py-2">Gross Salary</th>
                  <th className="px-4 py-2">Net Salary</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
              {currentDoctors.length > 0 ? (
  [...currentDoctors] // Create a shallow copy to avoid mutating the original array
    .sort((a, b) => a.employeeID.localeCompare(b.employeeID)) // Sort by employeeID
    .map((salary) => (
      <tr key={salary.employeeID} className="border-b">
        <td className="px-4 py-4">{salary.employeeID}</td>
        <td className="px-4 py-4">{salary.name}</td>
        <td className="px-4 py-4">{salary.baseSalary}</td>
        <td className="px-4 py-4">{salary.totalAllowances}</td>
        <td className="px-4 py-4">{salary.totalDeductions}</td>
        <td className="px-4 py-4">{salary.grossSalary}</td>
        <td className="px-4 py-4">{salary.netSalary}</td>
        <td className="px-4 py-4 relative">
          <button
            ref={buttonRef}
            onClick={() => toggleDropdown(salary.employeeID)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FaEllipsisV />
          </button>
          {dropdownVisible === salary.employeeID && (
            <div 
              ref={dropdownRef}
              className="absolute bg-white shadow-md rounded-lg p-2 mt-2 right-0 z-10"
            >
              <button
                onClick={() => {
                  handleEditDoctor(salary.employeeID);
                  handleOptionClick();
                  setIsModalOpen(true);
                }}
                className="w-full text-blue-400 text-left p-2 hover:bg-gray-100 flex items-center"
              >
                <FaEye className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  handleDeleteSalary(salary.employeeID);
                  handleOptionClick();
                }}
                className="w-full text-red-400 text-left p-2 hover:bg-gray-100 flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </td>
      </tr>
    ))
) : (
  <tr>
    <td colSpan="6" className="text-center p-4">
      No matching doctors found.
    </td>
  </tr>
)}

              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
                    <div>
                        <label>
                            Show{" "}
                            <select
                                value={entriesPerPage}
                                onChange={handleEntriesPerPageChange}
                                className="border p-2 rounded-md"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={25}>25</option>
                                <option value={30}>30</option>
                            </select>{" "}
                            entries per page
                        </label>
                    </div>
                    <div>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`px-3 py-1 border rounded-md mx-1 ${
                                    currentPage === index + 1 ? "bg-blue-300" : "hover:bg-blue-200"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
                </div>

      <div className="fixed bottom-5 right-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full shadow-md p-4 bg-blue-500 text-white text-xl hover:bg-blue-600"
        >
          <FaPlus />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 p-6 container max-h-[80vh] overflow-y-auto mx-auto relative">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Salary Structure" : "Add Salary Structure"}</h2>

            {/* Employee ID */}
            <div className="mb-4">
  <div className="grid grid-cols-2 gap-4">
    {/* Employee ID */}
    <div>
      <label className="block mb-2 font-bold">Employee ID</label>
      <input
        type="text"
        value={formData.employeeID}
        onChange={(e) => handleInputChange("employeeID", e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>

    <div>
      <label className="block mb-2 font-bold">Name</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>
    
    {/* Base Salary */}
    <div>
      <label className="block mb-2 font-bold">Base Salary</label>
      <input
        type="number"
        value={formData.baseSalary}
        onChange={(e) => handleInputChange("baseSalary", e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>
  </div>
</div>
            {/* Allowances */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">Allowances</label>
              {formData.allowances.map((allowances, index) => (
                <div key={index} className="flex mb-2 items-center">
                  <input
                    type="text"
                    placeholder="Allowance Name"
                    value={allowances.name}
                    onChange={(e) => updateField("allowances", index, "name", e.target.value)}
                    className="w-1/2 p-2 border rounded mr-2"
                  />
                  <input
                    type="number"
                    placeholder="Allowance Value"
                    value={allowances.value}
                    onChange={(e) => updateField("allowances", index, "value", e.target.value)}
                    className="w-1/2 p-2 border rounded"
                  />
                  <button
                    onClick={() => removeField("allowances", index)}
                    className="ml-2 text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addField("allowances")}
                className="text-blue-500"
              >
                Add Allowance
              </button>
            </div>

            {/* Deductions */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">Deductions</label>
              {formData.deductions.map((deductions, index) => (
                <div key={index} className="flex mb-2 items-center">
                  <input
                    type="text"
                    placeholder="Deduction Name"
                    value={deductions.name}
                    onChange={(e) => updateField("deductions", index, "value", e.target.value)}
                    className="w-1/2 p-2 border rounded mr-2"
                  />
                  <input
                    type="number"
                    placeholder="Deduction Percentage"
                    value={deductions.value}
                    onChange={(e) => updateField("deductions", index, "value", e.target.value)}
                    className="w-1/2 p-2 border rounded"
                  />
                  <button
                    onClick={() => removeField("deductions", index)}
                    className="ml-2 text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addField("deductions")}
                className="text-blue-500"
              >
                Add Deduction
              </button>
            </div>
            
            <div className="mb-4">
  <label className="block mb-2 font-bold">KPI</label>
  {formData.kpi?.map((kpi, index) => (
    <div key={index} className="flex mb-2 items-center">
      <input
        type="text"
        placeholder="KPI Name"
        value={kpi.name}
        onChange={(e) => updateField("kpi", index, "name", e.target.value)}
        className="w-1/2 p-2 border rounded mr-2"
      />
      <input
        type="number"
        placeholder="KPI Bonus Amount"
        value={kpi.value}
        onChange={(e) => updateField("kpi", index, "value", e.target.value)}
        className="w-1/2 p-2 border rounded"
      />
      <button
        onClick={() => removeField("kpi", index)}
        className="ml-2 text-red-500"
      >
        <FaTrash />
      </button>
    </div>
  ))}
  <button
  onClick={() => {
    addField("kpi");
    console.log("KPI after adding:", formData.kpi); // Debugging log
  }}
  className="text-blue-500"
>
  Add KPI Bonus
</button>

</div>
<div className="mb-4">
  <label className="block mb-2 font-bold">Leave Encashment Eligibility</label>
  {formData.leaveEncashment && (
    <div className="flex items-center space-x-2">
    <select
      value={formData.leaveEncashment}
      onChange={(e) => setFormData((prev) => ({ ...prev, leaveEncashment: e.target.value }))}
      className="p-1 border rounded w-40 text-sm"
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
    <button
      onClick={() => setFormData({ ...formData, leaveEncashment: "" })}
      className="text-red-500 p-1"
    >
      <FaTrash size={14} />
    </button>
  </div>
  
  )}
  {!formData.leaveEncashment && (
    <button
      onClick={() => setFormData({ ...formData, leaveEncashment: "Yes" })}
      className="text-blue-500"
    >
      Add Leave Encashment Eligibility
    </button>
  )}
</div>
            <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 font-bold">Total Allowance</label>
              <input
                type="number"
                value={formData.totalAllowances}
                disabled
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Total Deduction</label>
              <input
                type="number"
                value={formData.totalDeductions}
                disabled
                className="w-full p-2 border rounded"
              />
            </div>


            {/* Gross Salary and Net Salary */}
            <div className="mb-4">
              <label className="block mb-2 font-bold">Gross Salary</label>
              <input
                type="number"
                value={formData.grossSalary}
                disabled
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">Net Salary</label>
              <input
                type="number"
                value={formData.netSalary}
                disabled
                className="w-full p-2 border rounded"
              />
            </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {isEditing ? "Update" : "Save"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
     </div>
  );
};

export default SalaryStructure;
