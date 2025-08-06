import React from "react";
import DoctorPrescriptionView from "../doctor components/DoctorPrescriptionView";

const PrescriptionViewModal = ({ isOpen, onClose, appointmentId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-90vh overflow-y-auto">
        <div className="p-2">
          <DoctorPrescriptionView
            appointmentId={appointmentId}
            onClose={onClose}
            canEdit={true} // Set to false if you don't want doctors to edit the prescription
          />
        </div>
      </div>
    </div>
  );
};

export default PrescriptionViewModal;
