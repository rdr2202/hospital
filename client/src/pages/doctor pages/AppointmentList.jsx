import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('today');
  const [typeFilter, setTypeFilter] = useState('mine');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await axios.get('http://localhost:5000/api/doctor/getAllAppointmentsWithPatientData', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          dateFilter,
          typeFilter: "mine",
        }
      });

      const allAppointments = response.data || [];

      const filtered = allAppointments.filter((appointment) => {
        const date = new Date(appointment.medicalDetails?.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isDoctorMatch = typeFilter === 'mine'
          ? appointment.medicalDetails?.doctorId === userId
          : true;

        if (!isDoctorMatch) return false;

        if (dateFilter === 'today') {
          return date.toDateString() === today.toDateString();
        }

        if (dateFilter === 'this week') {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return date >= startOfWeek && date <= endOfWeek;
        }

        if (dateFilter === 'this month') {
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        }

        if (dateFilter === 'past') {
          return date < today;
        }

        return true;
      });


      setAppointments(filtered);

    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter, typeFilter]);

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  return (
    <DoctorLayout>
      <div className="container mx-auto p-3">
        <h1 className="text-2xl font-bold mb-6">Appointments</h1>

        <div className="flex gap-4 mb-6">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border p-2 rounded">
            <option value="today">Today</option>
            <option value="this week">This Week</option>
            <option value="this month">This Month</option>
            <option value="past">Past</option>
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border p-2 rounded">
            <option value="mine">Mine</option>
            <option value="all">All</option>
          </select>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <>
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2">Patient Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Consulting For</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Doctor</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time Slot</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((appointment, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-1 py-4">{appointment.name}</td>
                    <td className="px-1 py-4">{appointment.email}</td>
                    <td className="px-1 py-4">{appointment.medicalDetails?.consultingFor || 'Self'}</td>
                    <td className="px-1 py-4">{appointment.medicalDetails?.diseaseName || appointment.medicalDetails?.diseaseType?.name || 'N/A'}</td>
                    <td className="px-1 py-4">{appointment.medicalDetails?.doctorId}</td>
                    <td className="px-1 py-4">{new Date(appointment.medicalDetails?.appointmentDate).toLocaleDateString()}</td>
                    <td className="px-1 py-4">{appointment.medicalDetails?.timeSlot || 'N/A'}</td>
                    <td className="px-1 py-4">{appointment.medicalDetails?.prescriptionCreated ? 'Completed' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 mx-1 border rounded-lg"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 mx-1 border rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="px-4 py-2 mx-1 border rounded-lg"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </DoctorLayout>
  );
};

export default AppointmentList;
