import React, { useState, useEffect, useRef} from "react";
import { FaEllipsisV, FaPlus, FaFileExport, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddDoctorModal from "/src/pages/doctor pages/AddDoctorModal";
import config from '../../config';
const API_URL = config.API_URL;

const AssistDoc = () => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(null);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const [doctors, setDoctors] = useState([]);
    const [filter, setFilter] = useState({ query: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    
    // Fetch doctors from API
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${API_URL}/api/employees/all`);
                const data = await response.json();
                setDoctors(data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
        fetchDoctors();
    }, []);

    // Fetch specific doctor details
    const fetchDoctorById = async (employeeID) => {
        try {
            const response = await fetch(`${API_URL}/api/employees/getEmployeeById/${employeeID}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctor details");
            }
            const doctorData = await response.json();

            if (!doctorData || !doctorData.employeeID) {
                throw new Error("Invalid doctor data");
            }

            setSelectedDoctor(doctorData); // Pre-fill modal with fetched data
            setIsModalOpen(true); // Open the modal
        } catch (error) {
            console.error("Error fetching doctor by ID:", error);
            alert("Failed to fetch doctor details.");   
        }
    };

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
    const filteredDoctors = doctors.filter((doctor) =>
        ["employeeID", "name", "phone", "personalEmail"].some((field) =>
            doctor[field]?.toLowerCase().includes(filter.query.toLowerCase())
        )
    );
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentDoctors = filteredDoctors.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredDoctors.length / entriesPerPage);

    // Handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // View doctor details
    const handleViewDetails = (employeeID) => {
        navigate(`/assistdoc/doctorprofile/${employeeID}`);
    };

    // Open Add Doctor Modal
    const handleAddDoctor = () => {
        setSelectedDoctor(null); // Reset for add mode
        setIsModalOpen(true);
    };
    
    // Open Edit Doctor Modal
    const handleEditDoctor = (employeeID) => {
        setSelectedDoctor(null);  // Clear the previous selected doctor in case of modal reuse
        fetchDoctorById(employeeID);
    };

    const handleDoctorSave = (updatedDoctor) => {
        if (selectedDoctor) {
            // Edit mode: update existing doctor
            setDoctors((prevDoctors) =>
                prevDoctors.map((doc) =>
                    doc.employeeID === updatedDoctor.employeeID ? updatedDoctor : doc
                )
            );
        } else {
            // Add mode: add a new doctor
            setDoctors((prevDoctors) => [...prevDoctors, updatedDoctor]);
        }
    
        closeModal(); // Close modal after saving
    };
    
    // Delete a doctor
    const handleDeleteDoctor = async (employeeID) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            try {
                await fetch(`${API_URL}/api/employees/delete/${employeeID}`, { method: "DELETE" });
                setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.employeeID !== employeeID));
                if (currentDoctors.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1); // Adjust pagination if the last entry is deleted
                }
                alert("Doctor deleted successfully!");
            } catch (error) {
                console.error("Error deleting doctor:", error);
                alert("Failed to delete the doctor.");
            }
        }
    };

    // Toggle dropdown visibility
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
    const closeModal = () => {
        setSelectedDoctor(null); // Reset selected doctor
        setIsModalOpen(false); // Close modal
    };
    
    return (
        <div>
            <div className="p-2">
                {/* Search and Export Controls */}
                <div className="flex justify-between mb-6">
                    <input
                        type="text"
                        name="query"
                        placeholder="Search by any field"
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

                {/* Doctors Table */}
                <div className="relative w-full">
  {/* Scrollable container */}
  <div className="overflow-auto" style={{ maxHeight: "500px" }}>
  <table className="w-full border-collapse min-w-max">
    <thead className="bg-gray-100 sticky top-0 z-20">
      <tr>
        {/* Fixed left columns */}
        <th
          className="px-0.5 py-1 text-left sticky left-0 bg-gray-100 z-30 m-0"
          style={{ minWidth: "100px" }}
        >
          Doctor ID
        </th>
        <th
          className="px-0.5 py-1 text-left sticky left-[150px] bg-gray-100 z-30 m-0"
          style={{ minWidth: "90px" }}
        >
          Name
        </th>
        <th
          className="px-0.5 py-1 text-left sticky left-[300px] bg-gray-100 z-30 m-0"
          style={{ minWidth: "90px" }}
        >
          Designation
        </th>

        {/* Scrollable middle columns */}
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Phone No
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Email
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Date of Birth
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Gender
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Marital Status
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Nationality
        </th>    
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Secondary Contact
        </th> 
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Current Address
        </th>    
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Permanent Address
        </th> 
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Emergency Contact Name
        </th>  
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Emergency Contact Relationship
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Emergency Contact Number
        </th> 
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Department
        </th>     
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Date of Joining
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Employment Type
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Work Location
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Reporting Manager
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Work Shift
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Basic Salary
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Allowances
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Deductions
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Bank Account Number
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Bank Name
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          IFSC Code
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Payment Frequency
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          PF Number
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          ESI Number
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
          Tax Deduction Preferences
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Username System Access
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Temporary Password
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Access Level
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Highest Qualification
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Specialization
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Year Of Graduation
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Previous Employer
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Previous Duration
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Previous Job Role
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Total Experience
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        Medical Registration Number
        </th>
        <th className="px-0.5 py-1 text-left m-0" style={{ minWidth: "90px" }}>
        
        </th>
      </tr>
    </thead>
    <tbody>
      {currentDoctors.length > 0 ? (
        currentDoctors.map((doctor) => (
          <tr key={doctor.employeeID} className="border-b">
            {/* Fixed left columns */}
            <td
               className="px-0.5 py-3 text-left sticky left-0 bg-white m-0 cursor-pointer text-blue-500 hover:underline"
               style={{ minWidth: "150px" }}
               onClick={() => handleEditDoctor(doctor.employeeID)}
            >
              {doctor.employeeID}
            </td>
            <td
              className="px-0.5 py-3 text-left sticky left-[150px] bg-white m-0"
              style={{ minWidth: "150px" }}
            >
              {doctor.name}
            </td>
            <td
              className="px-0.5 py-3 text-left sticky left-[300px] bg-white m-0"
              style={{ minWidth: "150px" }}
            >
              {doctor.role}
            </td>

            {/* Scrollable middle columns */}
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.phone}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.personalEmail}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.dateOfBirth}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.gender}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.maritalStatus}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.nationality}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.secondaryContact}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.currentAddress}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.permanentAddress}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.emergencyContactName}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.emergencyContactRelationship}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.emergencyContactNumber}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.department}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.dateOfJoining}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.employmentType}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.workLocation}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.reportingManager}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.workShift}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.basicSalary}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.allowances}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.deductions}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.bankAccountNumber}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.bankName}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.ifscCode}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.paymentFrequency}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.pfNumber}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.esiNumber}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.taxDeductionPreferences}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.usernameSystemAccess}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.temporaryPassword}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.accessLevel}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.highestQualification}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.specialization}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.yearOfGraduation}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.previousEmployer}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.previousDuration}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.previousJobRole}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.totalExperience}
            </td>
            <td className="px-0.5 py-3 text-left m-0" style={{ minWidth: "150px" }}>
              {doctor.medicalRegistrationNumber}
            </td>

            {/* Fixed right column */}
            {/* Table Body */}

              </tr>
            ))
      ) : (
        <tr>
          <td colSpan="12" className="text-center py-3 px-0">
            No matching doctors found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

</div>

                {/* Pagination Controls */}
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

            {/* Add/Edit Doctor Modal */}
            {isModalOpen && (
                <AddDoctorModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleDoctorSave}
                    doctor={selectedDoctor} // Pass selected doctor for editing
                />
            )}
            {/* Add New Doctor Button */}
            <div className="fixed bottom-5 right-5">
                <button
                    onClick={handleAddDoctor}
                    className="rounded-full shadow-md p-4 bg-blue-500 text-white text-xl hover:bg-blue-600"
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
};

export default AssistDoc;
