import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "/src/components/patient components/Layout.jsx";
import { FaDownload, FaEye, FaCreditCard } from "react-icons/fa";
import axios from "axios";
import moment from "moment";
import config from "../../config";
const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filter, setFilter] = useState("all"); // Default filter
  const API_URL = config.API_URL;
  const navigate = useNavigate();

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/patient/getUserAppointments?filter=${filter}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // setConsultations(response.data);
        setConsultations(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch appointments");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentConsultations = consultations.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(consultations.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle viewing prescription
  const handleViewPrescription = (appointmentId) => {
    navigate(`/prescription/${appointmentId}`);
  };

  // Handle payment
  const handlePayment = (appointmentId) => {
    navigate(`/payment/${appointmentId}`);
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Consultation No,Date,Time,Consulting Doctor,Consulting For,Medical Payment,Prescription Status\n";
    
    consultations.forEach(consultation => {
      const row = [
        consultation._id,
        moment(consultation.appointmentDate).format("YYYY-MM-DD"),
        consultation.timeSlot,
        consultation.doctor?.name || "N/A",
        consultation.consultingFor || "N/A",
        consultation.medicalPayment || "No",
        consultation.prescriptionCreated ? "Created" : "Not Created"
      ];
      csvContent += row.join(",") + "\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consultation_history_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="p-7">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Consultation History</h1>
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded shadow transition duration-300"
          >
            <FaDownload />
            <span>Export</span>
          </button>
        </div>

        {/* Filter and Entries Per Page */}
        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
            >
              <option value="all">All Appointments</option>
              <option value="past">Past Appointments</option>
              <option value="today">Today's Appointments</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          
          <select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
          >
            <option value={5}>5 Entries</option>
            <option value={10}>10 Entries</option>
            <option value={20}>20 Entries</option>
          </select>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        ) : (
          <>
            {/* Consultations Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-3 text-gray-700 font-medium">Consultation No</th>
                    <th className="px-4 py-3 text-gray-700 font-medium">Date</th>
                    <th className="px-4 py-3 text-gray-700 font-medium">Time</th>
                    <th className="px-4 py-3 text-gray-700 font-medium">Consulting Doctor</th>
                    <th className="px-4 py-3 text-gray-700 font-medium">Consulting For</th>
                    <th className="px-4 py-3 text-gray-700 font-medium">Medical Payment</th>
                    <th className="px-4 py-3 text-gray-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentConsultations.length > 0 ? (
                    currentConsultations.map((consultation) => (
                      <tr key={consultation._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">{consultation._id.substring(0, 8)}...</td>
                        <td className="px-4 py-4">{moment(consultation.appointmentDate).format("YYYY-MM-DD")}</td>
                        <td className="px-4 py-4">{consultation.timeSlot}</td>
                        <td className="px-4 py-4">{consultation.doctor?.name || "N/A"}</td>
                        <td className="px-4 py-4">{consultation.consultingFor || "N/A"}</td>
                        <td className="px-4 py-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              consultation.medicalPayment === "Yes" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {consultation.medicalPayment === "Yes" ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-4 py-4 space-x-2 flex">
                          {consultation.prescriptionCreated ? (
                            <button
                              onClick={() => handleViewPrescription(consultation._id)}
                              className="text-white bg-green-500 hover:bg-green-600 py-2 px-3 rounded flex items-center space-x-1 transition duration-300"
                              title="View Prescription"
                            >
                              <FaEye size={14} />
                              <span>View</span>
                            </button>
                          ) : null}
                          
                          {consultation.medicalPayment !== "Yes" && (
                            <button
                              onClick={() => handlePayment(consultation._id)}
                              className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-3 rounded flex items-center space-x-1 transition duration-300"
                              title="Make Payment"
                            >
                              <FaCreditCard size={14} />
                              <span>Pay</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 py-6">
                        No Consultations Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {consultations.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstEntry + 1} to{" "}
                  {Math.min(indexOfLastEntry, consultations.length)} of{" "}
                  {consultations.length} entries
                </span>
                <div className="space-x-1">
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1 border ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      } rounded`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ConsultationHistory;