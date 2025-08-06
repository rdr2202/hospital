import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import 'react-datepicker/dist/react-datepicker.css';

function AssistLeave() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startShift, setStartShift] = useState(""); // Shift for the start date
  const [endShift, setEndShift] = useState(""); // Shift for the end date
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [shiftDetails, setShiftDetails] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [shift, setShift] = useState(''); // Shift (Full Day, First Half, Second Half)
  const [leaveBalance, setLeaveBalance] = useState({
    sickLeave: 0,
    casualLeave: 0,
    paidLeave: 0,
    maternityLeave: 0,
  });
  const [activeTab, setActiveTab] = useState('leaveRequest'); // state to track active tab

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
  
    const diffInMs = new Date(endDate) - new Date(startDate);
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  
    let totalDays = 0;
  
    // Handle single-day leave scenario
    if (diffInDays === 1) {
      if (startShift === "Full Day") totalDays += 1;
      else if (startShift === "First Half" || startShift === "Second Half") totalDays += 0.5;
    } else {
      // Add leave for the start date
      if (startShift === "Full Day") totalDays += 1;
      else if (startShift === "First Half" || startShift === "Second Half") totalDays += 0.5;
  
      // Add leave for the end date
      if (endShift === "Full Day") totalDays += 1;
      else if (endShift === "First Half" || endShift === "Second Half") totalDays += 0.5;
  
      // Add full days in between
      if (diffInDays > 2) totalDays += diffInDays - 2;
    }
  
    return totalDays;
  };
  
  // Recalculate total days whenever relevant fields change
  useEffect(() => {
    setTotalDays(calculateTotalDays());
  }, [startDate, endDate, startShift, endShift]);
  

  // Fetch leave requests for this assistant doctor
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setFetching(true);
      
        const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) {
          setError('Authentication token is missing');
          setFetching(false);
          return;
        }
      try {
        const leaveBalanceResponse = await axios.get(`${API_URL}/api/leaves/leave-balance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const response = await axios.get(`${API_URL}/api/leaves/my-requests`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });
        setLeaveBalance(leaveBalanceResponse.data);
        if (Array.isArray(response.data)) {
          setLeaveRequests(response.data);
        } else {
          console.error('Expected an array for leave requests, got:', response.data);
          setLeaveRequests([]);
        }
      } catch (error) {
        setError('Failed to fetch leave requests');
        console.error('Error fetching leave requests:', error);
      } finally {
        setFetching(false);
      }
    };
  
    fetchLeaveRequests();
  }, []);
  
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/shift/getShiftDetails`);
        setShiftDetails(response.data);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };
    fetchShifts();
  }, []);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate dates
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }
  
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      // const totalDays = Math.ceil(
      //   (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      // ) + 1; // Include both start and end dates
  
      const response = await axios.post(
        `${API_URL}/api/leaves/request`,
        {
          leaveType,
          startDate,
          endDate,
          reason,
          totalDays,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token here
          },
        }
      );
  
      alert('Leave request submitted successfully');
      setLeaveRequests([...leaveRequests, response.data]);
      setLeaveType('');
      setStartDate(new Date());
      setEndDate(new Date());
      setReason('');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Unauthorized. Please log in again.');
      } else {
        setError('Failed to submit leave request. Please try again.');
      }
      console.error('Error submitting leave request:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <DoctorLayout>
    <div className="max-w-4xl mt-4 mx-auto p-6 bg-gray-50 space-y-6">
    <div className="flex space-x-4 mb-6">
          <button
            onClick={() => switchTab('leaveRequest')}
            className={`text-lg font-semibold py-2 px-4 rounded-lg ${activeTab === 'leaveRequest' ? 'bg-blue-500 text-white' : 'bg-white text-blue-400'}`}
          >
            Leave Requests
          </button>
          <button
            onClick={() => switchTab('leaveStatus')}
            className={`text-lg font-semibold py-2 px-4 rounded-lg ${activeTab === 'leaveStatus' ? 'bg-blue-500 text-white' : 'bg-white text-blue-400'}`}
          >
            Leave Status
          </button>
          <button
            onClick={() => switchTab('leaveBalance')}
            className={`text-lg font-semibold py-2 px-4 rounded-lg ${activeTab === 'leaveBalance' ? 'bg-blue-500 text-white' : 'bg-white text-blue-400'}`}
          >
            Leave Balance
          </button>
        </div>

        {activeTab === 'leaveRequest' && (
          <div className="p-6 bg-white space-y-6">
      {/* <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">Request Leave</h2> */}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="" disabled>Choose Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Paid Leave">Paid Leave</option>
            <option value="Maternity">Maternity</option>
            
          </select>
        </div>
        <div className="flex flex-wrap items-start gap-4">
  {/* Start Date */}
  <div className="flex-1 min-w-[200px]">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Start Date
    </label>
    <DatePicker
      selected={startDate}
      onChange={handleStartDateChange}
      className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
    />
  </div>

  {/* Start Shift */}
  <div className="flex-1 min-w-[200px]">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Start Shift
    </label>
    <select
      value={startShift}
      onChange={(e) => setStartShift(e.target.value)}
      required
      className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
    >
      <option value="">Select Shift</option>
      {shiftDetails.map((shift) => (
        <optgroup key={shift._id} label={shift.name}>
          <option value="Full Day">{shift.fullDay} (Full Day)</option>
          <option value="First Half">{shift.firstHalf} (Half Day - First Session)</option>
          <option value="Second Half">{shift.secondHalf} (Half Day - Second Session)</option>
        </optgroup>
      ))}
    </select>
  </div>
</div>
<div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">End Shift</label>
          <select
            value={endShift}
            onChange={(e) => setEndShift(e.target.value)} // Update selectedShift state
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">Select Shift</option>
            {shiftDetails.map((shift) => (
              <optgroup key={shift._id} label={shift.name}>
                <option value="Full Day">{shift.fullDay} (Full Day)</option>
                <option value="First Half">{shift.firstHalf} (Half Day - First Session)</option>
                <option value="Second Half">{shift.secondHalf} (Half Day - Second Session)</option>
              </optgroup>
            ))}
          </select>
          </div>
          </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Total Leaves Requested
          </label>
          <p className="text-gray-700 font-semibold">
            {totalDays > 0 ? `${totalDays} day(s)` : 'Select start and end dates'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          className={`block w-1/3 p-3 text-white font-semibold rounded-lg mx-auto ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </button>
      </form>
      </div>
    )}

    {activeTab === 'leaveStatus' && (
          <div className="p-6 bg-white space-y-6">
      <h2 className="text-2xl font-bold text-gray-700 border-b pb-2">My Leave Requests</h2>
      {fetching ? (
        <p className="text-gray-600">Loading leave requests...</p>
      ) : leaveRequests.length === 0 ? (
        <p className="text-gray-600">No leave requests found.</p>
      ) : (
        <ul className="space-y-4">
          {leaveRequests.map((request) => (
            <li
              key={request._id}
              className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-700">
                  {request.leaveType}
                </p>
                <p className="text-sm text-gray-500">
                  From{' '}
                  {new Date(request.startDate).toLocaleDateString()} to{' '}
                  {new Date(request.endDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  request.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : request.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {request.status}
              </span>
            </li>
          ))}
        </ul>
      )}
      </div>
    )}
   
   {activeTab === 'leaveBalance' && (
  <div className="p-6 space-y-6">
  {/* <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">Leave Balance</h2> */}
  {fetching ? (
    <p className="text-center text-gray-500 text-lg">Loading leave balance...</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sick Leave */}
      <div className="p-6 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Sick Leave</h3>
        <p className="text-gray-700 text-xl font-bold">{leaveBalance.sickLeave} days</p>
      </div>
      
      {/* Casual Leave */}
      <div className="p-6 bg-gradient-to-r from-green-100 via-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Casual Leave</h3>
        <p className="text-gray-700 text-xl font-bold">{leaveBalance.casualLeave} days</p>
      </div>

      {/* Paid Leave */}
      <div className="p-6 bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Paid Leave</h3>
        <p className="text-gray-700 text-xl font-bold">{leaveBalance.paidLeave} days</p>
      </div>

      {/* Maternity Leave */}
      <div className="p-6 bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-pink-900 mb-2">Maternity Leave</h3>
        <p className="text-gray-700 text-xl font-bold">{leaveBalance.maternityLeave} days</p>
      </div>
    </div>
  )}
</div>

)}


    </div>
    </DoctorLayout>
  );
}

export default AssistLeave;
