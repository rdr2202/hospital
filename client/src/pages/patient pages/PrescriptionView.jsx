import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "/src/components/patient components/Layout.jsx";
import axios from "axios";
import moment from "moment";
import { FaArrowLeft, FaDownload, FaPrint } from "react-icons/fa";
import config from "../../config";
const PrescriptionView = () => {
  const { appointmentId } = useParams();
  console.log(appointmentId);
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = config.API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log("PrescriptionView: ", token);
        // Fetch appointment details
        const appointmentResponse = await axios.get(`${API_URL}/api/patient/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setAppointment(appointmentResponse.data);
        
        // Fetch prescription
        const prescriptionResponse = await axios.get(`${API_URL}/api/prescription/appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        setPrescription(prescriptionResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch prescription");
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  const handlePrint = () => {
    window.print();
  };

  // Function to download prescription as PDF (would require a PDF generating library in a real app)
  const handleDownload = () => {
    // For demonstration, we'll just alert
    alert("PDF download functionality would be implemented here");
    // In a real app, you would use a library like jsPDF or call a backend endpoint
  };

  // Go back to consultation history
  const handleGoBack = () => {
    navigate("/consulthistory");
  };

  return (
    <Layout>
      <div className="p-7 max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Consultation History
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded shadow transition duration-300"
            >
              <FaPrint />
              <span>Print</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow transition duration-300"
            >
              <FaDownload />
              <span>Download</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        ) : (
          <div className={`bg-white rounded-lg shadow-lg p-8 ${appointment?.medicalPayment !== "Yes" ? "prescription-blur" : ""}`}>
            {/* Payment required message */}
            {appointment?.medicalPayment !== "Yes" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10 rounded-lg">
                <div className="text-xl font-bold text-red-600 mb-4">Payment Required</div>
                <p className="text-gray-700 mb-4 text-center max-w-md">
                  Please complete the payment to view the full prescription details
                </p>
                <button
                  onClick={() => navigate(`/payment/${appointmentId}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full shadow-md transition duration-300"
                >
                  Make Payment
                </button>
              </div>
            )}
            
            {/* Prescription Content */}
            <div className="prescription-content">
              {/* Header */}
              <div className="text-center mb-8 pb-6 border-b">
                <h1 className="text-2xl font-bold text-blue-800">Medical Prescription</h1>
                <p className="text-gray-600">
                  Date: {moment(appointment?.appointmentDate).format("MMMM DD, YYYY")} | Time: {appointment?.timeSlot}
                </p>
              </div>
              
              {/* Doctor and Patient Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Doctor Information</h2>
                  <p className="text-gray-700">Dr. {prescription?.doctorName || "N/A"}</p>
                  <p className="text-gray-700">{prescription?.doctorSpecialty || "Specialist"}</p>
                  <p className="text-gray-700">License: {prescription?.doctorLicense || "N/A"}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Patient Information</h2>
                  <p className="text-gray-700">{prescription?.patientName || "N/A"}</p>
                  <p className="text-gray-700">Consulting For: {appointment?.consultingFor || "N/A"}</p>
                  <p className="text-gray-700">Disease Type: {appointment?.diseaseType?.name || "N/A"}</p>
                </div>
              </div>
              
              {/* Diagnosis */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Diagnosis</h2>
                <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                  {prescription?.diagnosis || "No diagnosis information available"}
                </p>
              </div>
              
              {/* Medications */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Medications</h2>
                {prescription?.medications?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-4 py-2 text-left">Medicine</th>
                          <th className="border px-4 py-2 text-left">Dosage</th>
                          <th className="border px-4 py-2 text-left">Frequency</th>
                          <th className="border px-4 py-2 text-left">Duration</th>
                          <th className="border px-4 py-2 text-left">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medications.map((med, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                            <td className="border px-4 py-2">{med.name}</td>
                            <td className="border px-4 py-2">{med.dosage}</td>
                            <td className="border px-4 py-2">{med.frequency}</td>
                            <td className="border px-4 py-2">{med.duration}</td>
                            <td className="border px-4 py-2">{med.instructions || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No medications prescribed</p>
                )}
              </div>
              
              {/* Notes */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Doctor's Notes</h2>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-line">
                  {appointment?.notes || "No additional notes"}
                </div>
              </div>
              
              {/* Follow-up */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Follow-up Information</h2>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p><strong>Type:</strong> {appointment?.follow || "N/A"}</p>
                  <p><strong>Comments:</strong> {appointment?.followComment || "No comments"}</p>
                  {appointment?.followUpTimestamp && (
                    <p><strong>Follow-up Date:</strong> {moment(appointment.followUpTimestamp).format("MMMM DD, YYYY")}</p>
                  )}
                </div>
              </div>
              
              {/* Footer/Signature */}
              <div className="mt-12 pt-6 border-t text-right">
                <p className="text-gray-700 mb-2">Dr. {prescription?.doctorName || "Doctor"}</p>
                <p className="italic text-gray-600">Digital Signature</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for blurred prescription when payment not made */}
      <style jsx>{`
        .prescription-blur .prescription-content {
          filter: blur(4px);
          user-select: none;
          pointer-events: none;
        }
        
        @media print {
          button, .bg-opacity-90 {
            display: none !important;
          }
          
          .prescription-blur .prescription-content {
            filter: none;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Layout>
  );
};

export default PrescriptionView;