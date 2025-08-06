import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const DraftViewModal = ({ isOpen, onClose, patientData }) => {
  const [draft, setDraft] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // You could fetch the draft content from an API here if needed
    if (patientData && patientData.medicalDetails && patientData.medicalDetails.drafts) {
      setDraft(patientData.medicalDetails.drafts);
    } else {
      setDraft('No draft content available for this patient.');
    }
  }, [patientData]);

  if (!isOpen) return null;

  const handleCreatePrescription = () => {
    // Navigate to the prescription writing page with patient data
    navigate('/prescription-writing', { 
      state: { 
        patientData: patientData 
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header with close button */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">Draft Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        {/* Patient details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Patient Name:</span>
            <span className="ml-2">{patientData?.name || 'N/A'}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Phone Number:</span>
            <span className="ml-2">{patientData?.phone || 'N/A'}</span>
          </div>
        </div>
        
        {/* Draft content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <h4 className="font-semibold text-gray-700 mb-2">Draft Content:</h4>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {draft}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-4">
        {patientData.medicalDetails?.prescriptionCreated ? (
        <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
        >
            Prescription written
        </button>
        ) : (
        <button
            onClick={handleCreatePrescription}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
        >
            Create Prescription
        </button>
        )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftViewModal;