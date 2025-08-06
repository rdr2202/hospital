import React, { useState, useEffect } from "react";
import Layout from "../../components/patient components/Layout";
import referfrnd from "/src/assets/images/patient images/referfrnd.png";
import axios from "axios";
import config from "../../config";
const API_URL = config.API_URL;

const ReferFriend = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [referrals, setReferrals] = useState([]);
  
  // Filter and pagination states
  const [filters, setFilters] = useState({
    status: "",
    validity: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const validateForm = () => {
    const errors = {};
    if (!name) {
      errors.name = "Name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.name = "Name should only contain letters and spaces";
    }
    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${API_URL}/api/patient/referFriend`,
          {
            friendName: name,
            friendPhone: phone,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSuccessMessage("Referral sent successfully!");
        setErrorMessage("");
        setName("");
        setPhone("");
        // Refresh referrals list
        fetchReferrals();
        console.log(response.data);
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          console.error("Backend Error:", error.response.data.message);
          setErrorMessage(error.response.data.message);
        } else {
          console.error("Unknown error:", error);
          setErrorMessage("Failed to send referral. Please try again later.");
        }
        setSuccessMessage("");
      }
    }
  };

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/patient/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferrals(res.data.referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Filter referrals based on status and validity
  const filteredReferrals = referrals.filter((referral) => {
    const statusMatch = filters.status === "" || 
      referral.status.toLowerCase().includes(filters.status.toLowerCase());
    
    const validityMatch = filters.validity === "" || 
      referral.validity.toLowerCase().includes(filters.validity.toLowerCase());
    
    return statusMatch && validityMatch;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentReferrals = filteredReferrals.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredReferrals.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Outdated":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-red-600 bg-red-100";
    }
  };

  return (
    <Layout>
      <div className="space-y-0 p-6">
        <div className="flex flex-col lg:flex-row justify-center max-h-screen p-4 space-y-6 lg:space-y-0 lg:space-x-12 mt-6">
          <div className="lg:w-1/3">
            <img
              src={referfrnd}
              alt="Refer a Friend"
              className="w-full h-auto mx-auto lg:mx-0"
            />
          </div>
          <div className="lg:w-1/3">
            <h1 className="text-2xl font-bold mb-4">Refer a Friend</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 border rounded ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your friend's name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-100 text-gray-700">
                    +91
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      if (digitsOnly.length <= 10) {
                        setPhone(digitsOnly);
                      }
                    }}
                    className={`w-full p-2 border rounded-r ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {successMessage && (
                <p className="text-green-500 text-sm">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
              >
                Refer
              </button>
            </form>
          </div>
        </div>

        {/* Referred Friends Table */}
        <div className="mx-auto max-w-6xl mt-10">
          <h2 className="text-2xl font-bold mb-4">Referred Friends</h2>
          
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              name="friendName"
              placeholder="Search by Friend Name"
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 w-1/6 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
            >
              <option value="">All Status</option>
              <option value="Accepted">Accepted</option>
              <option value="Pending">Pending</option>
              <option value="Outdated">Outdated</option>
            </select>
            <input
              type="text"
              name="validity"
              value={filters.validity}
              onChange={handleFilterChange}
              placeholder="Search by Validity Date"
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Validity</th>
                  <th className="px-4 py-2">Referral Code</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentReferrals.length > 0 ? (
                  currentReferrals.map((friend, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-4">{friend.friendName}</td>
                      <td className="px-4 py-4">{friend.date}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            friend.status
                          )}`}
                        >
                          {friend.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">{friend.validity}</td>
                      <td className="px-4 py-4">{friend.referralCode}</td>
                      <td className="px-4 py-4">
                        <button
                          className={`px-4 py-2 rounded-md ${
                            friend.status === "Accepted"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={friend.status !== "Accepted"}
                        >
                          Redeem
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No matching referrals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                </select>{" "}
                entries per page
              </label>
            </div>
            <div>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-1 border rounded-md mx-1 ${
                    currentPage === index + 1
                      ? "bg-blue-300"
                      : "hover:bg-blue-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md mx-1 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReferFriend;