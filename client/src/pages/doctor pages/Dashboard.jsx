import React, { useState, useEffect } from 'react';
import profile from '/src/assets/images/doctor images/profile.jpg';
import doc from '/src/assets/images/doctor images/doc.jpg';
import Online_Doctor from '/src/assets/images/doctor images/Online_Doctor.jpg';
import AssisstentDoctors from '/src/assets/images/doctor images/AssisstentDoctors.jpg';
import Consultation from '/src/assets/images/doctor images/Consultation.jpg';
import cal1 from '/src/assets/images/doctor images/cal1.jpg';
import { FaPhone, FaStar, FaEllipsisV, FaClock, FaArrowLeft, FaArrowRight, FaVideo, FaTimes, FaCheck } from 'react-icons/fa';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import Select from "react-select";
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  // State for appointments and date navigation
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  // State for dashboard counts
  const [patientsToday, setPatientsToday] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [consultCount, setConsultCount] = useState(0);

  // State for notes
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // State for patient tabs
  const [activeTab, setActiveTab] = useState("Consultation");
  const [selectedDoctors, setSelectedDoctors] = useState({});

  // Generate dates for the next 7 days
  useEffect(() => {
    const generateDates = () => {
      const today = new Date();
      const result = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        result.push(d.toISOString().split("T")[0]);
      }
      setDates(result);
    };

    generateDates();
  }, []);

  // Fetch appointments based on selected date
  useEffect(() => {
    if (dates.length === 0) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const selectedDate = dates[currentDateIndex];

        const response = await axios.get(
          "http://localhost:5000/api/doctor/getAllAppointmentsWithPatientData",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              selectedDate,
            },
          }
        );

        setAppointments(response.data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentDateIndex, dates]);

  // Fetch patient count
  useEffect(() => {
    const fetchPatientCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/log/list', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatientCount(response.data.length);
      } catch (error) {
        console.error("Error fetching patient count:", error);
      }
    };

    fetchPatientCount();
  }, []);

  // Fetch today's appointments
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/doctor/getAppointments', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            dateFilter: "today",
            typeFilter: "mine"
          }
        });

        const appointmentsData = response.data.appointments || [];
        setTodayCount(appointmentsData.length);

        const formattedPatients = appointmentsData.map((item) => ({
          name: item.patientName,
          diagnosis: item.diseaseType?.name || "Not specified",
          time: item.timeSlot
        }));

        setPatientsToday(formattedPatients);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, []);

  // Fetch doctor count
  useEffect(() => {
    const fetchDocCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/employees/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDocCount(response.data.length);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDocCount();
  }, []);

  // Fetch consultation count
  useEffect(() => {
    const fetchConsultCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/doctor/getAppointments?dateFilter=past&typeFilter=mine', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setConsultCount(response.data.appointments.length);
      } catch (err) {
        console.log(err);
      }
    };

    fetchConsultCount();
  }, []);

  // Navigation handlers
  const handlePrevDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };

  const handleNextDate = () => {
    if (currentDateIndex < dates.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

  // Note handlers
  const addNote = () => {
    if (newNote.trim() !== '') {
      setNotes([...notes, newNote]);
      setNewNote('');
    }
  };

  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const markAsDone = (index) => {
    setNotes(
      notes.map((note, i) => (i === index ? `✅ ${note}` : note))
    );
  };

  // Doctor selection handler
  const handleDoctorSelect = (patientId, selectedOption) => {
    setSelectedDoctors((prevSelected) => ({
      ...prevSelected,
      [patientId]: selectedOption,
    }));
  };

  // Data for overview cards
  const overviewCards = [
    { title: 'Today Appointment', count: todayCount, color: 'bg-blue-100', image: cal1 },
    { title: 'Total Patients', count: patientCount, color: 'bg-indigo-100', image: Online_Doctor },
    { title: 'Consultations', count: consultCount, color: 'bg-pink-100', image: Consultation },
    { title: 'Assistant Doctors', count: docCount - 1, color: 'bg-yellow-100', image: AssisstentDoctors },
    { title: 'Inventory', count: '75%', color: 'bg-red-100', image: AssisstentDoctors },
  ];

  // Sample data for different sections
  const doctors = [
    { name: 'Dr. Alex Brown', assignedWork: 'Medicine', completed: true, profilePic: doc },
    { name: 'Dr. Emma Green', assignedWork: 'Consultation', completed: false, profilePic: profile },
    { name: 'Dr. John Smith', assignedWork: 'Call log', completed: true, profilePic: cal1 },
    { name: 'Dr. Alex Brown', assignedWork: 'Medicine', completed: true, profilePic: doc },
    { name: 'Dr. Emma Green', assignedWork: 'Call log', completed: false, profilePic: profile },
    { name: 'Dr. John Smith', assignedWork: 'Consultation', completed: true, profilePic: cal1 },
  ];

  const patientReviews = [
    { name: 'Theron Trump', date: '2 days ago', rating: 4, review: 'Great service and care. Highly recommended!' },
    { name: 'John Doe', date: '5 days ago', rating: 5, review: 'Excellent attention to detail and patient care.' },
  ];

  const payments = [
    { name: 'Theron Trump', description: 'Kidney function test', date: 'Sunday, 16 May', amount: '$25.15', img: profile },
    { name: 'John Doe', description: 'Emergency appointment', date: 'Sunday, 16 May', amount: '$99.15', img: doc },
    { name: 'Sarah Johnson', description: 'Complementation test', date: 'Sunday, 16 May', amount: '$40.45', img: profile },
    { name: 'Theron Trump', description: 'Kidney function test', date: 'Sunday, 16 May', amount: '$25.15', img: profile },
    { name: 'John Doe', description: 'Emergency appointment', date: 'Sunday, 16 May', amount: '$99.15', img: doc },
  ];

  const doctorOptions = [
    { value: "dr_admin", label: "Self" },
    { value: "dr_smith", label: "Dr. Smith" },
    { value: "dr_johnson", label: "Dr. Johnson" },
    { value: "dr_brown", label: "Dr. Brown" },
  ];

  // Sample patient data for tables
  const consultationPatients = [
    { id: "C045", name: "John Doe", date: "2024-09-26", time: "10:00 AM", disease: "Fever", diseaseType: "Acute" },
    { id: "C048", name: "Jane Doe", date: "2024-09-26", time: "11:00 AM", disease: "Heartattack", diseaseType: "Chronic" },
    { id: "C049", name: "Jack Black", date: "2024-09-27", time: "01:00 PM", disease: "Diabetes", diseaseType: "Chronic" },
    { id: "C050", name: "Jake White", date: "2024-09-27", time: "02:00 PM", disease: "flu", diseaseType: "acute" },
  ];

  const medicinePatients = [
    { id: "C049", name: "Jack Black", date: "2024-09-27", time: "01:00 PM", disease: "Diabetes", diseaseType: "Chronic" },
    { id: "C050", name: "Jake White", date: "2024-09-27", time: "02:00 PM", disease: "flu", diseaseType: "acute" },
    { id: "C051", name: "Emily Davis", date: "2024-09-28", time: "03:00 PM", disease: "Asthma", diseaseType: "Chronic" },
    { id: "C0052", name: "Michael Brown", date: "2024-09-28", time: "04:00 PM", disease: "Arthritis", diseaseType: "Chronic" },
  ];

  const prescriptionPatients = [
    { id: "C051", name: "Emily Davis", date: "2024-09-28", time: "03:00 PM", disease: "Asthma", diseaseType: "Chronic" },
    { id: "C052", name: "Michael Brown", date: "2024-09-28", time: "04:00 PM", disease: "Arthritis", diseaseType: "Chronic" },
    { id: "C042", name: "Jack Black", date: "2024-09-27", time: "01:00 PM", disease: "Diabetes", diseaseType: "Chronic" },
    { id: "C043", name: "Jake White", date: "2024-09-27", time: "02:00 PM", disease: "flu", diseaseType: "acute" },
  ];

  // Chart data
  const barData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Percentage (%)',
        data: [79, 75, 84, 82, 93],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Month vs Percentage',
      },
    },
  };

  const pieData = {
    labels: ['Acute', 'Chronic'],
    datasets: [
      {
        data: [27, 15],
        backgroundColor: ['#FFB6C1', '#B0E0E6'],
        hoverBackgroundColor: ['#FF9AA2', '#A2D2FF'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // Table rendering function
  const renderTable = (patients) => (
    <table className="min-w-full table-auto">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="px-4 py-2">Patient ID</th>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Time</th>
          <th className="px-4 py-2">Disease</th>
          <th className="px-4 py-2">Disease Type</th>
          <th className="px-4 py-2">Doctor</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{patient.id}</td>
            <td className="px-4 py-2">{patient.name}</td>
            <td className="px-4 py-2">{patient.date}</td>
            <td className="px-4 py-2">{patient.time}</td>
            <td className="px-4 py-2">{patient.disease}</td>
            <td className="px-4 py-2">{patient.diseaseType}</td>
            <td className="px-4 py-2">
              <Select
                options={doctorOptions}
                value={selectedDoctors[patient.id] || null}
                onChange={(selectedOption) => handleDoctorSelect(patient.id, selectedOption)}
                className="w-48"
                placeholder="Select Doctor"
                isClearable
                isSearchable
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <DoctorLayout>
        <div className="flex p-6 space-x-6">
          {/* Main content area */}
          <div className="flex-1 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
              {overviewCards.map((card, index) => (
                <div
                  key={index}
                  className={`p-4 md:p-6 ${card.color} rounded-lg shadow-lg flex flex-col items-center justify-between h-48 w-full`}
                >
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-20 w-30 rounded-full object-cover mb-2"
                    />
                  )}
                  <div className="text-center">
                    <div className="text-sm md:text-base text-gray-600">{card.title}</div>
                    <div className="text-lg font-semibold text-gray-700">{card.count}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Your Patients Today */}
            <div className="w-full p-4 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-gray-700 font-semibold">Your Patients Today</h2>
                <button className="text-sm text-blue-600 hover:underline">See All</button>
              </div>
              <hr className="border-gray-200 mb-4" />
              <ul className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-white">
                {patientsToday.map((patient, index) => (
                  <li
                    key={index}
                    className="py-2 border-b border-gray-200 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={doc}
                        alt="Patient"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{patient.name}</div>
                        <div className="text-sm text-gray-800">{patient.diagnosis}</div>
                        <div className="flex items-center mt-1 space-x-1">
                          <FaClock className="text-gray-400" />
                          <span className="text-sm text-gray-500">{patient.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="bg-green-500 text-white p-2 rounded-full">
                        <FaVideo className="text-sm" />
                      </button>
                      <button className="bg-red-500 text-white p-2 rounded-full">
                        <FaTimes className="text-sm" />
                      </button>
                      <button className="text-gray-500">
                        <FaEllipsisV />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acute vs Chronic Patients */}
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <h3 className="text-lg text-gray-700 mb-4">Acute vs Chronic Patients</h3>
                <div className="w-48 h-48 mx-auto">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>

              {/* Inventory Bar Chart */}
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <h3 className="text-lg text-gray-700 mb-4">Inventory</h3>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            {/* Patient Management Tabs */}
            {/* <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex space-x-4 mb-4">
                {["Consultation", "Medicine", "Prescription"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === tab
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                {activeTab === "Consultation" && renderTable(consultationPatients)}
                {activeTab === "Medicine" && renderTable(medicinePatients)}
                {activeTab === "Prescription" && renderTable(prescriptionPatients)}
              </div>
            </div> */}
          </div>

          {/* Right Sidebar - Upcoming Appointments */}
          <div className="w-1/4 p-4 bg-white rounded-lg shadow-lg space-y-4">
            <h2 className="text-lg mb-4 text-gray-700">Upcoming Appointments</h2>
            <hr className="border-gray-200 mb-4" />

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-white">
              <button 
                onClick={handlePrevDate} 
                disabled={currentDateIndex === 0} 
                className="text-gray-500 p-2"
              >
                <FaArrowLeft />
              </button>
              <div className="flex items-center space-x-2">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg ${
                      currentDateIndex === index 
                        ? "bg-blue-400 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setCurrentDateIndex(index)}
                  >
                    {new Date(date).toLocaleDateString("en-IN", { 
                      day: "numeric", 
                      month: "short" 
                    })}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleNextDate} 
                disabled={currentDateIndex === dates.length - 1} 
                className="text-gray-500 p-2"
              >
                <FaArrowRight />
              </button>
            </div>

            {/* Appointment List */}
            <ul className="space-y-3 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-white">
              {loading && <p className="text-gray-500">Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && appointments.length === 0 && (
                <p className="text-gray-500">No appointments found.</p>
              )}

              {appointments.map((appt, index) => (
                <li 
                  key={index} 
                  className="py-2 border-b border-gray-200 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={appt.img || "/doctor.jpg"} 
                      alt="patient" 
                      className="w-10 h-10 rounded-full" 
                    />
                    <div>
                      <div className="font-medium text-black">{appt.name}</div>
                      <div className="text-sm text-gray-800">
                        {appt.medicalDetails?.consultingFor}
                      </div>
                      <div className="flex items-center mt-2 space-x-1">
                        <FaClock className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {appt.medicalDetails?.timeSlot}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <button className="text-gray-500 mt-2">
                      <FaEllipsisV />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DoctorLayout>
    </div>
  );
}

export default Dashboard;