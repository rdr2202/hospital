import React, { useState } from "react";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { FaEllipsisV, FaPlus, FaFileExport, FaEye, FaTrash } from "react-icons/fa"; // Import the icons
import { useNavigate } from "react-router-dom";
import AddDoctorModal from "/src/pages/doctor pages/AddDoctorModal.jsx"; // Import the AddDoctorModal component

const Doctors = () => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(null);

    const [doctors, setDoctors] = useState([
        { id: "D001", name: "Dr. John Smith", createdAt: "2024-01-12", phone: "123-456-7890", email: "johnsmith@example.com", status:"active" },
        { id: "D002", name: "Dr. Jane Adams", createdAt: "2024-02-18", phone: "098-765-4321", email: "janeadams@example.com", status:"active" },
        { id: "D003", name: "Dr. Emily Johnson", createdAt: "2024-03-05", phone: "234-567-8901", email: "emilyjohnson@example.com", status:"inactive" },
    ]);

    const [filter, setFilter] = useState({
        query: "",
        status: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
        setCurrentPage(1);
    };

    const handleEntriesPerPageChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const queryMatch = doctor.id.toLowerCase().includes(filter.query.toLowerCase()) ||
            doctor.name.toLowerCase().includes(filter.query.toLowerCase()) ||
            doctor.phone.toLowerCase().includes(filter.query.toLowerCase()) ||
            doctor.email.toLowerCase().includes(filter.query.toLowerCase());

        const statusMatch = filter.status === "" || doctor.status.toLowerCase() === filter.status.toLowerCase();

        return queryMatch && statusMatch;
    });


    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentDoctors = filteredDoctors.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredDoctors.length / entriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBgColor = (status) => {
        if (status === "active") return "bg-green-200";
        if (status === "inactive") return "bg-red-200";
    }

    const handleViewDetails = (id) => {
        navigate(`/assistdoc/doctorprofile/${id}`);
    };

    const handleAddDoctor = () => {
        setIsModalOpen(true); // Open the modal when the button is clicked
    };

    const handleExport = () => {
        alert("Exporting doctors' data...");
    };

    const handleDeleteDoctor = (id) => {
        // Implement the delete functionality here
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            setDoctors(doctors.filter((doctor) => doctor.id !== id));
        }
    };

    const toggleDropdown = (id) => {
        setDropdownVisible(dropdownVisible === id ? null : id);
    };

    return (
        <DoctorLayout>
            <div className="p-7">
                <h1 className="text-2xl font-semibold mb-4">Doctors</h1>

                {/* Search and Export Controls */}
                <div className="flex justify-between mb-6">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            name="query"
                            placeholder="Search by any field"
                            value={filter.query}
                            onChange={handleFilterChange}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        />
                        <select
                        name="status"
                        value={filter.status}
                        onChange={handleFilterChange}
                        className="p-2 w-1/2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        
                    </select>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition-all flex items-center"
                    >
                        <FaFileExport className="mr-2" />
                        Export
                    </button>
                </div>

                {/* Doctors Table */}
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="px-4 py-2">Doctor ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Created At</th>
                            <th className="px-4 py-2">Phone No</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDoctors.length > 0 ? (
                            currentDoctors.map((doctor) => (
                                <tr key={doctor.id} className="border-b">
                                    <td className="px-4 py-4">{doctor.id}</td>
                                    <td className="px-4 py-4">{doctor.name}</td>
                                    <td className="px-4 py-4">{doctor.createdAt}</td>
                                    <td className="px-4 py-4">{doctor.phone}</td>
                                    <td className="px-4 py-4">{doctor.email}</td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(
                                                doctor.status
                                            )}`}
                                        >
                                            {doctor.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 relative">
                                        <button
                                            onClick={() => toggleDropdown(doctor.id)}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                        {dropdownVisible === doctor.id && (
                                            <div className="absolute bg-white shadow-md rounded-lg p-2 mt-2 right-0 z-10">
                                                <button
                                                    onClick={() => handleViewDetails(doctor.id)}
                                                    className="  w-full text-blue-400 text-left p-2 hover:bg-gray-100 flex items-center"
                                                >
                                                    <FaEye className="mr-2" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDoctor(doctor.id)}
                                                    className="  w-full text-red-400 text-left p-2 hover:bg-gray-100 flex items-center"
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

            {/* Floating Button for Adding Doctors */}
            <button
                onClick={handleAddDoctor}
                className="fixed bottom-10 right-10 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all"
                aria-label="Add New Doctor"
            >
                <FaPlus size={20} />
            </button>

            {/* Add Doctor Modal */}
            <AddDoctorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </DoctorLayout>
    );
};

export default Doctors ;
