import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
const API_URL = config.API_URL;

const LeaveSettingsForm = () => {
  const [sickLeave, setSickLeave] = useState('');
  const [casualLeave, setCasualLeave] = useState('');
  const [paidLeave, setPaidLeave] = useState('');
  const [maternityLeave, setMaternityLeave] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch leave settings
  useEffect(() => {
    const fetchLeaveSettings = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored after login
        if (!token) {
          setError('You are not authenticated. Please log in.');
          return;
        }

        const response = await axios.get(`${API_URL}/api/leaves/get-leave-settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { sickLeave, casualLeave, paidLeave, maternityLeave } = response.data.leaveSettings;
        setSickLeave(sickLeave || '');
        setCasualLeave(casualLeave || '');
        setPaidLeave(paidLeave || '');
        setMaternityLeave(maternityLeave || '');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch leave settings.');
      }
    };

    fetchLeaveSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // Assuming token is stored after login
      if (!token) {
        setError('You are not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/leaves/set-leave-settings`,
        { sickLeave, casualLeave, paidLeave, maternityLeave },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('Leave settings updated successfully!');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to update leave settings. Try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Leave Settings</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Sick Leave Days</label>
          <input
            type="number"
            value={sickLeave}
            onChange={(e) => setSickLeave(e.target.value)}
            placeholder="Enter sick leave days"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Casual Leave Days</label>
          <input
            type="number"
            value={casualLeave}
            onChange={(e) => setCasualLeave(e.target.value)}
            placeholder="Enter casual leave days"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Paid Leave Days</label>
          <input
            type="number"
            value={paidLeave}
            onChange={(e) => setPaidLeave(e.target.value)}
            placeholder="Enter paid leave days"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Maternity Leave Days</label>
          <input
            type="number"
            value={maternityLeave}
            onChange={(e) => setMaternityLeave(e.target.value)}
            placeholder="Enter maternity leave days"
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  
  );
};

export default LeaveSettingsForm;
