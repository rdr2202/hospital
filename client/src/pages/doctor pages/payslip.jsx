import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css'; // Add CSS for date picker

const LeaveTable = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState({
    name: '',
    fromDate: null,
    toDate: null,
    description: '',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch leave details from the server
  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leaves/all'); // Adjust URL as needed
         // Ensure response.data is an array
         if (Array.isArray(response.data)) {
          setLeaves(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching leaves:', error);
      }
    };
    
    fetchLeaveDetails();
  }, []);
  if (!Array.isArray(leaves) || leaves.length === 0) {
    return <p>No leaves available</p>;
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveLeave = async () => {
    const { name, fromDate, toDate, description } = leaveDetails;
    if (name && fromDate && toDate && description) {
      try {
        // Sending leave details to the backend
        const response = await axios.post('http://localhost:5000/api/leaves/add', {
          name,
          fromDate,
          toDate,
          description,
        });

        console.log('Leave Saved:', response.data);
        setLeaveData((prevState) => [...prevState, response.data.leave]); // Add the newly saved leave to the state
        setIsSidebarOpen(false); // Close the sidebar after saving
        setLeaveDetails({ name: '', fromDate: null, toDate: null, description: '' }); // Reset form fields
      } catch (error) {
        console.error('Error saving leave details:', error);
        alert('An error occurred while saving leave details.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  const handleCancel = () => {
    setIsSidebarOpen(false);
    setLeaveDetails({ name: '', fromDate: null, toDate: null, description: '' });
  };

  

  return (
    <div className="relative">
    {/* Main Page */}
    <div className="bg-blue-600 text-white">
    <button>Add Leave</button>
    </div>

      {/* Slide-out Sidebar for Adding Leave */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-end">
          <div className="bg-white w-96 p-6 mt-20 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add Leave</h2>

            <div className="mb-4">
              <label className="block text-gray-600">Name</label>
              <input
                type="text"
                name="name"
                value={leaveDetails.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter leave name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600">From Date</label>
              <DatePicker
                selected={leaveDetails.fromDate}
                onChange={(date) =>
                  setLeaveDetails((prevState) => ({
                    ...prevState,
                    fromDate: date,
                  }))
                }
                className="w-full p-2 border rounded"
                placeholderText="Select start date"
                dateFormat="dd/MM/yyyy"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600">To Date</label>
              <DatePicker
                selected={leaveDetails.toDate}
                onChange={(date) =>
                  setLeaveDetails((prevState) => ({
                    ...prevState,
                    toDate: date,
                  }))
                }
                className="w-full p-2 border rounded"
                placeholderText="Select end date"
                dateFormat="dd/MM/yyyy"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600">Description</label>
              <textarea
                name="description"
                value={leaveDetails.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter leave description"
              ></textarea>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLeave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
        <table className="tw-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">From Date</th>
              <th className=" px-4 py-2">To Date</th>
              <th className=" px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave, index) => (
              <tr key={index} lassName="border-b">
                <td className=" px-4 py-4">{leave.name}</td>
                <td className=" px-4 py-4">{new Date(leave.fromDate).toLocaleDateString()}</td>
                <td className=" px-4 py-4">{new Date(leave.toDate).toLocaleDateString()}</td>
                <td className=" px-4 py-4">{leave.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    </div>
  );
};

export default LeaveTable;
