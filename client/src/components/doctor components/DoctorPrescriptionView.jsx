import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FaArrowLeft, FaDownload, FaPrint, FaEdit } from "react-icons/fa";
import config from "../../config";

const DoctorPrescriptionView = ({ appointmentId, onClose, canEdit = true }) => {
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
            Authorization: `Bearer ${token}`,
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
  }, [appointmentId, API_URL]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For demonstration, we'll just alert
    alert("PDF download functionality would be implemented here");
    // In a real app, you would use a library like jsPDF or call a backend endpoint
  };

  const handleEdit = () => {
    // Navigate to edit prescription page or open edit modal
    if (canEdit && prescription) {
      // You could navigate to an edit page or open a modal here
      // Example: navigate(`/doctor/edit-prescription/${appointmentId}`);
      alert("Edit prescription functionality would be implemented here");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onClose}
          className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="flex space-x-3">
          {canEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow transition duration-300"
            >
              <FaEdit />
              <span>Edit</span>
            </button>
          )}
          
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
        <div className="bg-white">
          {/* Prescription Content */}
          <div className="prescription-content">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b">
              <h1 className="text-2xl font-bold text-blue-800">Medical Prescription</h1>
              <p className="text-gray-600">
                Date: {moment(appointment?.appointmentDate).format("MMMM DD, YYYY")} | Time: {appointment?.timeSlot}
              </p>
              {appointment?.status && (
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                  appointment.status === "completed" ? "bg-green-100 text-green-800" : 
                  appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" : 
                  appointment.status === "cancelled" ? "bg-red-100 text-red-800" : 
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </div>
              )}
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
                <p className="text-gray-700">{prescription?.patientName || appointment?.patientName || "N/A"}</p>
                <p className="text-gray-700">Consulting For: {appointment?.consultingFor || "N/A"}</p>
                <p className="text-gray-700">Disease Type: {appointment?.diseaseType?.name || "N/A"}</p>
                <p className="text-gray-700">Contact: {appointment?.patientEmail || "N/A"}</p>
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
      
      {/* CSS for print mode */}
      <style jsx>{`
        @media print {
          button {
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorPrescriptionView;