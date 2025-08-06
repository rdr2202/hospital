import { useEffect, useState } from "react";
import Layout from "../../components/patient components/Layout";
import axios from "axios";
import {
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import config from "../../config";
const API_URL = config.API_URL;

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/patient/?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAppointments(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "confirmed":
        return `${base} bg-green-100 text-green-700`;
      case "reserved":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "cancelled":
        return `${base} bg-red-100 text-red-700`;
      case "completed":
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          My Appointments
        </h1>

        {loading ? (
          <div className="text-center text-gray-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500">No appointments found.</p>
        ) : (
          <>
            <div className="grid gap-6">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-blue-800">
                      {appt.doctor?.name || "Dr. Unassigned"}
                    </h2>
                    <span className={getStatusBadge(appt.status)}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500" />
                      <span>
                        {new Date(appt.appointmentDate).toLocaleDateString()} (
                        {appt.timeSlot})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-500" />
                      <span>₹ {appt.price || "N/A"}</span>
                    </div>

                    {appt.diseaseName && (
                      <div className="text-sm text-gray-500">
                        Reason:{" "}
                        <span className="font-medium">{appt.diseaseName}</span>
                      </div>
                    )}
                    {appt.meetLink && (
                      <div className="mt-2">
                        {(() => {
                          const slotTime = appt.timeSlot || "00:00";
                          const [hours, minutes] = slotTime
                            .split(":")
                            .map(Number);

                          const appointmentDateTime = new Date(
                            appt.appointmentDate
                          );
                          appointmentDateTime.setHours(hours);
                          appointmentDateTime.setMinutes(minutes);
                          appointmentDateTime.setSeconds(0);
                          appointmentDateTime.setMilliseconds(0);

                          const now = new Date();
                          const fifteenMinutesBefore = new Date(
                            appointmentDateTime.getTime() - 15 * 60 * 1000
                          );
                          const thirtyMinutesAfter = new Date(
                            appointmentDateTime.getTime() + 30 * 60 * 1000
                          );

                          const isLive =
                            now >= fifteenMinutesBefore &&
                            now <= thirtyMinutesAfter;

                          return isLive ? (
                            <a
                              href={appt.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                              Join Video Call
                            </a>
                          ) : (
                            <button
                              disabled
                              className="inline-block px-4 py-2 bg-gray-300 text-gray-600 rounded-md text-sm cursor-not-allowed"
                              title="Link active 15 min before to 30 min after the slot"
                            >
                              Join Unavailable
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    {/* {appt.notes && (
                      <div className="text-sm text-gray-500">
                        Notes: <span className="font-medium">{appt.notes}</span>
                      </div>
                    )} */}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
