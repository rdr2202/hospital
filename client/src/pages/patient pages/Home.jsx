import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/patient components/Layout";
import { BsBell, BsSearch } from "react-icons/bs";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  BsClipboard,
  BsWallet,
  BsHourglassSplit,
  BsTicketPerforated,
  BsFileEarmarkText,
  BsDownload,
} from "react-icons/bs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import doctor from "/src/assets/images/patient images/doctor.jpeg";
import config from "../../config";
const API_URL = config.API_URL;

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const Home = () => {
  const [activeTab, setActiveTab] = useState("Live");
  const navigate = useNavigate();

  const data = {
    labels: ["Morning", "Afternoon", "night"], // Days of the week
    datasets: [
      {
        label: "Dosage Taken each meal",
        data: [1, 2, 2],
        backgroundColor: [
          "rgba(255, 149, 172)",
          "rgba(54, 162, 235)",
          "rgba(255, 206, 86)",
          "rgba(75, 192, 192)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // Weekly labels
    datasets: [
      {
        label: "Weekly Dosage Intake",
        data: [52, 73, 75, 92], // Example data for each week
        backgroundColor: "#2196F3", // Blue color
        borderColor: "#1976D2",
        borderWidth: 1,
      },
    ],
  };
  const lineOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%"; // Convert to percentage
          },
        },
      },
    },
  };
  const [pendingAppointments, setPendingAppointments] = useState(0);

  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const token = localStorage.getItem("token"); // or your token key
        const response = await axios.get(
          `${API_URL}/api/patient/pendingAppointments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPendingAppointments(response.data.pendingAppointments);
      } catch (error) {
        console.error("Error fetching pending appointments:", error);
      }
    };

    if (activeTab === "Live") {
      fetchPendingAppointments();
    }
  }, [activeTab]); // refetch when tab switches to 'Live'

  const [couponCount, setCouponCount] = useState(0);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/patient/pendingCoupons`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCouponCount(response.data.availableCoupons || 0);
      } catch (error) {
        console.log("Error fetching coupon count available");
      }
    };
    fetchCoupons();
  }, [activeTab]);

  const [upcomingAppointments, setUpcomingAppointments] = useState(null);
  useEffect(() => {
    const fetchUpcomingAppointment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/patient/upComingAppointment`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUpcomingAppointments(response.data.appointment);
      } catch (error) {
        console.log("Error fetching upcoming appointments");
      }
    };
    fetchUpcomingAppointment();
  }, [activeTab]);

  const [transactionHistory, setTransactionHistory] = useState([]);
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/patient/transactionHistory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransactionHistory(response.data.transactions || []);
      } catch (error) {
        console.log("Error fetching transaction history");
      }
    };
    fetchTransactionHistory();
  }, [activeTab]);

  const [transaction, setTransaction] = useState(null);
  useEffect(() => {
    const fetchPendingTransaction = async () => {
      try {
        const token = await localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/patient/pendingTransactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransaction(response.data);
      } catch (error) {
        console.log("Unable to fetch pending transactions");
      }
    };
    fetchPendingTransaction();
  }, [activeTab]);

  const handlePay = () => {
    navigate("/payments");
  };

  return (
    <div>
      <Layout>
        <div className="min-h-screen flex">
          {/* Sidebar */}

          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-800">
                Patient Management Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <BsSearch className="text-xl text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="bg-gray-50 p-3">
              {/* Tabs for Live and Past */}
              <div className="mb-6 flex justify-center">
                <button
                  className={`px-6 py-2 font-bold ${
                    activeTab === "Live"
                      ? "text-white bg-blue-500"
                      : "text-gray-600 bg-gray-200"
                  } rounded-l-lg`}
                  onClick={() => setActiveTab("Live")}
                >
                  Live
                </button>
                <button
                  className={`px-6 py-2 font-bold ${
                    activeTab === "Past"
                      ? "text-white bg-blue-500"
                      : "text-gray-600 bg-gray-200"
                  } rounded-r-lg`}
                  onClick={() => setActiveTab("Past")}
                >
                  Past
                </button>
              </div>

              {/* Live Tab Content */}
              {activeTab === "Live" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-purple-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-full p-2">
                        <BsClipboard className="text-2xl text-violet-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">
                        Upcoming Appointment
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">
                      {pendingAppointments}
                    </p>
                  </div>

                  <div className="bg-pink-200 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <BsHourglassSplit className="text-2xl text-pink-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Pending Transaction
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">1</p>
                  </div>

                  <div className="bg-green-200 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <BsTicketPerforated className="text-2xl text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Coupons
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">
                      {couponCount}
                    </p>
                  </div>
                </div>
              )}

              {/* Past Tab Content */}
              {activeTab === "Past" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-300 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-full p-2">
                        <BsWallet className="text-2xl text-blue-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">
                        Transactions
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">5</p>
                  </div>

                  <div className="bg-purple-300 shadow-md rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-full p-2">
                        <BsClipboard className="text-2xl text-violet-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">
                        Consultations
                      </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">2</p>
                  </div>

                  <div className="bg-green-200 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <BsTicketPerforated className="text-2xl text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Used Coupons
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">3</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow-md rounded-lg p-4 flex flex-col">
                <div className="flex items-center mb-4">
                  <img
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-4"
                    src={doctor}
                    alt="Doctor's Name"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Upcoming Appointment
                    </h3>
                  </div>
                </div>
                {upcomingAppointments ? (
                  <div className="flex flex-col">
                    <p className="text-xl font-semibold text-gray-800">
                      {upcomingAppointments.doctorName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <p className="text-md text-gray-700">
                          {format(
                            new Date(upcomingAppointments.date),
                            "dd MMMM yyyy"
                          )}
                        </p>
                        <p className="text-md text-gray-500">
                          {upcomingAppointments.timeSlot}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No upcoming appointment
                  </p>
                )}
              </div>
              <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col min-h-[150px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Transaction History
                  </h3>
                  <button className="text-blue-500 hover:underline">
                    See All
                  </button>
                </div>
                <div className="flex flex-col flex-grow">
                  {transactionHistory.length === 0 ? (
                    <p className="text-gray-500">No recent transactions</p>
                  ) : (
                    transactionHistory.map((txn, idx) => (
                      <div key={idx}>
                        <p className="text-md font-semibold text-gray-700">
                          {txn.service}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-md text-gray-700">{txn.date}</p>
                          <p className="text-md text-gray-500">{txn.amount}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Pending Transactions
                  </h4>
                </div>

                {transaction ? (
                  <div className="flex flex-col">
                    <p className="text-md font-semibold text-gray-800">
                      {transaction.service}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-md text-gray-700">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-md text-gray-500">
                        ₹{transaction.amount}
                      </p>
                    </div>
                    <button
                      onClick={handlePay}
                      className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                    >
                      Pay
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-md text-center">
                    No pending transactions
                  </p>
                )}
              </div>
            </div>

            {/* Blood Group Information */}

            {/* Dosage Pie Chart */}
            <div className="mt-6">
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-ful">
                <div className="p-4 bg-white rounded-lg shadow-lg ">
                  <h2 className="text-base font-semibold text-gray-800 mb-4 ">
                    Medicine Dosage{" "}
                  </h2>
                  <div className="w-48 h-48 mx-auto">
                    {" "}
                    {/* Set width and height of the chart */}
                    <Pie data={data} />
                      {" "}
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-4 ">
                  <h2 className="text-base font-bold text-gray-800 mb-4">
                    Performance Analysis
                  </h2>
                  <Line
                    data={lineData}
                    options={{ scales: { y: { beginAtZero: true } } }}
                  />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BsFileEarmarkText className="mr-2" /> Reports
                    </h3>
                    <button className="text-blue-500 hover:underline">
                      See All
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Ramya</p>
                      </div>
                      <p className="text-md text-gray-500">15 June 2024</p>
                      <BsDownload className="mr-2 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Rahul</p>
                      </div>
                      <p className="text-md text-gray-500">12 Feb 2024</p>
                      <BsDownload className="mr-2 text-blue-500" />
                                
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Ramya</p>
                      </div>
                      <p className="text-md text-gray-500">12 Dec 2023</p>
                      <BsDownload className="mr-2 text-blue-500" />
                                
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="text-md text-gray-700">Ramya</p>
                      </div>
                      <p className="text-md text-gray-500">12 April 2023</p>
                      <BsDownload className="mr-2 text-blue-500" />
                                
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
