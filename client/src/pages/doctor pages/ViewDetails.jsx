import React, { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import patientprofile from "/src/assets/images/doctor images/patientprofile.jpg";
import { useParams } from "react-router-dom";
import axios from 'axios';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ViewDetails = () => {
  const { id } = useParams(); // Move this to the top
  const [patientDetails, setPatientDetails] = useState({});
  const [pastHistory, setPastHistory] = useState([]);
  const [futureHistory, setFutureHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("Medicine");

  // Fetch patient details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/patient/patientById/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatientDetails(response.data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };
    fetchDetails();
  }, [id]);

  // Fetch past appointments
  useEffect(() => {
    const fetchPastHistory = async () => {
      if (!id) return;
      
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/doctor/getAppointmentWithTimedata', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id,
            type: 'past'
          }
        });
        setPastHistory(response.data);
      } catch (error) {
        console.error('Error fetching past history:', error);
      }
    };
    fetchPastHistory();
  }, [id]);

  // Fetch future appointments
  useEffect(() => {
    const fetchFutureHistory = async () => {
      if (!id) return;
      
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/doctor/getAppointmentWithTimedata', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            id,
            type: 'future'
          }
        });
        setFutureHistory(response.data);
      } catch (error) {
        console.error('Error fetching future history:', error);
      }
    };
    fetchFutureHistory();
  }, [id]);

  const pieData = {
    labels: ['Successful Intake', 'Missed'],
    datasets: [
      {
        label: 'Medicine Intake',
        data: [80, 20],
        backgroundColor: ['#7ccf7f', '#ff7369'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 1,
      },
    ],
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount || 0}`;
  };

  return (
    <DoctorLayout>
      <div className="p-10 rounded-md">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="p-5 bg-purple-100 shadow-md rounded-lg flex items-center border-1 border-blue-100">
              <img
                src={patientDetails.profilePhoto || patientprofile}
                alt="Patient"
                className="w-24 h-24 rounded-full mr-4 border-2 border-gray-300"
              />
              <div>
                <h2 className="text-xl font-bold mt-5">{patientDetails.name || 'Loading...'}</h2>
                <p className="text-gray-600 mt-3">Patient ID: {patientDetails._id || 'N/A'}</p>
                <p className="text-gray-600">Created On: {formatDate(patientDetails.createdAt)}</p>
                <p className="mt-4 font-semibold">Medical Record: {patientDetails.medicalRecords || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-1 mb-4 pr-4">
            <div className="p-4 bg-purple-100 shadow-md rounded-lg border-1 border-blue-100">
              <p className="text-gray-700">
                <span className="font-semibold">Age:</span> {patientDetails.age || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Gender:</span> {patientDetails.gender || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Email:</span> {patientDetails.email || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Phone:</span> {patientDetails.phone || 'N/A'}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Address:</span> {patientDetails.currentLocation || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Disease History and Medicine/Workshop Tabs */}
        <div className="flex flex-wrap mb-4">
          {/* Disease History Container */}
          <div className="w-full lg:w-1/2 mb-4 pr-4">
            <div className="bg-white shadow-md rounded-md border-1 border-blue-100 h-96 flex flex-col">
              <h2 className="text-xl font-semibold p-5 pb-3 flex-shrink-0">Disease History</h2>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <div className="space-y-4">
                  {pastHistory.length > 0 ? (
                    pastHistory.map((item) => (
                      <div key={item._id} className="p-2 border-b border-gray-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {item.diseaseName || 'Unknown Disease'}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {formatDate(item.appointmentDate)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-700">
                                  {formatCurrency(item.fee)}
                                </p>
                                <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                                  Prescription
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No past appointments found</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medicine and Workshop Tabs Container */}
          <div className="w-full lg:w-1/2 mb-4">
            <div className="ml-1 bg-white shadow-md rounded-lg border-1 border-blue-100 h-96 flex flex-col">
              {/* Tab Switch - Fixed Header */}
              <div className="flex justify-center border-b p-3 pb-0 flex-shrink-0">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "Medicine"
                      ? "text-blue-500 font-bold border-blue-500 border-b-2"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("Medicine")}
                >
                  Medicine
                </button>
                <button
                  className={`px-4 py-2 ml-2 ${
                    activeTab === "Workshop"
                      ? "text-blue-500 font-bold border-blue-500 border-b-2"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("Workshop")}
                >
                  Workshop
                </button>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-3 pt-4">
                <div className="space-y-4">
                  {activeTab === "Medicine" ? (
                    <div className="space-y-4">
                      {/* Sample Medicine Records */}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV123456</p>
                            <p className="text-gray-600 text-sm">Monday, 12 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 10:00 AM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 200</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV123457</p>
                            <p className="text-gray-600 text-sm">Wednesday, 14 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 02:00 PM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 150</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Add more sample records to demonstrate scrolling */}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV123458</p>
                            <p className="text-gray-600 text-sm">Friday, 16 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 03:00 PM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 300</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV123459</p>
                            <p className="text-gray-600 text-sm">Sunday, 18 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 11:00 AM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 175</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Sample Workshop Records */}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV654321</p>
                            <p className="text-gray-600 text-sm">Friday, 15 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 02:00 PM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 300</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV654322</p>
                            <p className="text-gray-600 text-sm">Saturday, 16 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 10:00 AM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 250</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Add more sample records to demonstrate scrolling */}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV654323</p>
                            <p className="text-gray-600 text-sm">Monday, 19 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 09:00 AM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 400</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700">INV654324</p>
                            <p className="text-gray-600 text-sm">Wednesday, 21 Sep 2024</p>
                            <p className="text-gray-600 text-sm">Time: 04:00 PM</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">Rs. 350</p>
                            <button className="text-blue-400 hover:text-blue-500 text-sm font-bold">
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-wrap space-x-9">
          {/* Upcoming Appointments Container */}
          <div className="w-full md:w-1/2 lg:w-1/3 bg-white shadow-md rounded-lg border-1 border-blue-100 h-96 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 p-4 pb-3 flex-shrink-0">Upcoming Appointments</h2>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-4">
                {futureHistory.length > 0 ? (
                  futureHistory.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="p-4 border border-blue-100 rounded-lg shadow-sm bg-white"
                    >
                      <p className="text-lg font-medium text-gray-700">
                        {appointment.diseaseName || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fee: {formatCurrency(appointment.fee)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Review Container */}
          <div className="w-full md:w-1/2 lg:w-1/3 bg-white shadow-md rounded-lg border-1 border-blue-100 h-96 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 p-4 pb-3 flex-shrink-0">Patient Review</h2>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img
                    className="w-12 h-12 rounded-full"
                    src={patientDetails.profilePhoto || "https://via.placeholder.com/150"}
                    alt="Patient Profile"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800">{patientDetails.name || 'Patient'}</h3>
                  <p className="text-gray-600 text-sm">Reviewed on: 10th September 2024</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((star, index) => (
                      <svg
                        key={index}
                        className={`w-4 h-4 ${
                          index < 4 ? "text-yellow-500" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .587l3.668 7.429 8.2 1.193-5.922 5.771 1.396 8.146L12 18.896l-7.342 3.863 1.396-8.146L.132 9.209l8.2-1.193L12 .587z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-3 text-gray-700">
                    "Great experience! The doctor was very professional and helpful. The treatment has been effective."
                  </p>
                  {/* Additional review content to demonstrate scrolling */}
                  <p className="mt-3 text-gray-700">
                    "I would definitely recommend this doctor to others. The follow-up care was excellent and the staff was very accommodating."
                  </p>
                  <p className="mt-3 text-gray-700">
                    "The clinic environment was clean and welcoming. Wait times were minimal and the appointment was handled efficiently."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medicine Intake Statistics Container */}
          <div className="w-full md:w-1/2 lg:w-1/4 bg-white shadow-md rounded-lg border-1 border-blue-100 h-96 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 p-4 pb-3 text-center flex-shrink-0">
              Medicine Intake Statistics
            </h2>
            <div className="flex-1 flex items-center justify-center px-4 pb-4">
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default ViewDetails;