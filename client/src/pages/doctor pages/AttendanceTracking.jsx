import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../../config';
const API_URL = config.API_URL;

function AttendanceTracking() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Get current date in "YYYY-MM-DD" format
  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = localStorage.getItem("token"); // Fetch the token from storage
        const response = await axios.get(
          `${API_URL}/api/attendance/getAttendance`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token in headers
            },
          }
        );
        setAttendanceData(response.data);
        setFilteredData(response.data); // Initialize filtered data
        setLoading(false);
      } catch (err) {
        setError("Error fetching attendance data");
        setLoading(false);
      }
    };
  
    fetchAttendanceData();
  }, []);

  // Filter logic
  const handleFilter = () => {
    let filtered = [...attendanceData];

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employeeID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (record) => record.date === dateFilter // Ensure the date format matches exactly
      );
    }

    // Prioritize current-date records
    const currentDateRecords = filtered.filter(
      (record) => record.date === currentDate
    );
    const otherRecords = filtered.filter((record) => record.date !== currentDate);

    setFilteredData([...currentDateRecords, ...otherRecords]);
  };

  useEffect(() => {
    handleFilter();
  }, [searchTerm, statusFilter, dateFilter]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-2">

      {/* Filters Section */}
      <div className="mb-4 flex flex-col lg:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by Employee ID or Name"
          className="border px-4 py-2 rounded w-full lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border px-4 py-2 rounded w-full lg:w-1/3"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Filter by Status</option>
          <option value="At Work">At Work</option>
          <option value="On Break">On Break</option>
        </select>

        <input
          type="date"
          className="border px-4 py-2 rounded w-full lg:w-1/3"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 ">Employee ID</th>
              <th className="px-4 py-2 ">Name</th>
              <th className="px-4 py-2 ">Date</th>
              <th className="px-4 py-2 ">Status</th>
              <th className="px-4 py-2 ">Total Elapsed Time (hrs)</th>
              <th className="px-4 py-2 ">Break Time (hrs)</th>
            </tr>
          </thead>
           <tbody>
            {filteredData.map((record, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-4">{record.employeeID}</td>
                <td className="px-4 py-4">{record.name}</td>
                <td className="px-4 py-4">{record.date}</td>
                <td className="px-4 py-4 font-semibold">
                <span
                  className={`${
                    record.status === "At Work" ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {record.status}
                </span>
              </td>
                <td className="px-4 py-4 text-center">
                  {record.totalElapsedTime}
                </td>
                <td className="px-4 py-4 text-center">
                  {record.breakTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No records match the filters.
          </p>
        )}  
      </div>
    </div>
  );
}

export default AttendanceTracking;
