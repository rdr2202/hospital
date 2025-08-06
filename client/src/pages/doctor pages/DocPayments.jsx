import React, { useState } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Payments =() => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible]=useState(null);

    const [patients, setPatients] = useState([
        { id: "P001", name: "John Doe",date: "2024-09-12 10:30 AM", service: "Consultation", amount: "Rs.500", method: "G Pay" },
        { id: "P002", name: "Jane Smith",date: "2024-09-11 2:00 PM", service: "Workshop", amount: "Rs.300", method: "PhonePe" },
        { id: "P003", name: "Emily Johnson",date: "2024-09-10 3:45 PM", service: "Medicine", amount: "Rs.600", method: "Amazon Pay" },
        { id: "P004", name: "John Doe",date: "2024-09-12 10:30 AM", service: "Consultation", amount: "Rs.500", method: "G Pay" },
        { id: "P005", name: "Jane Smith",date: "2024-09-11 2:00 PM", service: "Workshop", amount: "Rs.300", method: "PhonePe" },
        { id: "P006", name: "Emily Johnson",date: "2024-09-10 3:45 PM", service: "Consultation", amount: "Rs.500", method: "Amazon Pay" },
        { id: "P007", name: "John Doe",date: "2024-09-12 10:30 AM", service: "Medicine", amount: "Rs.400", method: "G Pay" },
        { id: "P008", name: "Jane Smith",date: "2024-09-11 2:00 PM", service: "Workshop", amount: "Rs.300", method: "PhonePe" },
        { id: "P009", name: "Emily Johnson",date: "2024-09-10 3:45 PM", service: "Consultation", amount: "Rs.500", method: "Amazon Pay" },
        { id: "P010", name: "John Doe",date: "2024-09-12 10:30 AM", service: "Medicine", amount: "Rs.300", method: "G Pay" },
        { id: "P011", name: "Jane Smith",date: "2024-09-11 2:00 PM", service: "Workshop", amount: "Rs.300", method: "PhonePe" },
        { id: "P012", name: "Jane Smith",date: "2024-09-11 2:00 PM", service: "Workshop", amount: "Rs.300", method: "PhonePe" },
        // Add more patients as needed
           ]);


    const [filters, setFilters] = useState({
        patientId: "",
        service: "",
        method: "",
    });

    const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
    const [entriesPerPage, setEntriesPerPage] = useState(10); // Tracks number of entries per page

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on entries change
    };

    // Search by Patient ID and apply other filters
    const filteredPatients = patients.filter((patient) =>
        patient.id.toLowerCase().includes(filters.patientId.toLowerCase()) &&
        (filters.service === "" || patient.service.toLowerCase().includes(filters.service.toLowerCase())) &&
        (filters.method === "" || patient.method.toLowerCase().includes(filters.method.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredPatients.length / entriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to assign background color based on status
    const getStatusBgColor = (service) => {
        switch (service) {
            case "Consultation":
                return "bg-green-100 text-green-700";
            case "Workshop":
                return "bg-blue-100 text-blue-700";
            case "Medicine":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "";
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/payments/viewdetails/${id}`);
    };
    const toggleDropdown = (id) => {
        setDropdownVisible(dropdownVisible === id ? null : id);
    };


    return (
        <DoctorLayout>
            <div className="p-7">
                <h1 className="text-2xl font-bold mb-4">Payments</h1>

                {/* Filters */}
                <div className="flex space-x-4 mb-6">
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Search by Patient ID"
                        value={filters.patientId}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    />
                    <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">Select Date Range</option>
                        <option value="today">Today</option>
                        <option value="lastWeek">Last Week</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3Months">Last 3 Months</option>
                        <option value="last6Months">Last 6 Months</option>
                        <option value="lastYear">Last Year</option>
                    </select>
                    <select
                        name="service"
                        value={filters.service}
                        onChange={handleFilterChange}
                        className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Services</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Medicine">Medicine</option>
                    </select>
                    <select
                        name="method"
                        value={filters.method}
                        onChange={handleFilterChange}
                        className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Methods</option>
                        <option value="G Pay">G Pay</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Amazon Pay">Amazon Pay</option>
                    </select>
                </div>

                {/* Patient Table */}
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="px-4 py-2">Patient ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Date & Time</th>
                            <th className="px-4 py-2">Service</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Methods</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPatients.length > 0 ? (
                            currentPatients.map((patient) => (
                                <tr key={patient.id} className="border-b">
                                    <td className="px-4 py-4">{patient.id}</td>
                                    <td className="px-4 py-4">{patient.name}</td>
                                    <td className="px-4 py-4">{patient.date}</td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(
                                                patient.service
                                            )}`}
                                        >
                                            {patient.service}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">{patient.amount}</td>
                                    <td className="px-4 py-4">{patient.method}</td>
                                    <td className="px-4 py-4 relative">
                                        <button className="text-gray-600 hover:text-gray-900"
                                          onClick={() => toggleDropdown(patient.id)}
                                        >
                                            <FaEllipsisV />
                                        </button>
                                        {/* Dropdown menu */}
                                        {dropdownVisible === patient.id && (
                                            <div className="absolute bg-white shadow-md rounded-lg p-2 mt-2 right-0 z-10">
                                            <button 
                                            onClick={()=>handleViewDetails(patient.id)}
                                            className="block w-full text-left p-2 hover:bg-gray-100">
                                            View Details
                                            </button>
                                        </div>
                                        )}
                
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center p-4">
                                    No matching patients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination controls */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <label>
                            Show{" "}
                            <select value={entriesPerPage} onChange={handleEntriesPerPageChange} className="border p-2 rounded-md">
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
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
        </DoctorLayout>
    );
};

export default Payments;
