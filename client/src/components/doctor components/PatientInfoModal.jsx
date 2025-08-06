import React from 'react';
import { X, Phone, Mail, MapPin, Calendar, User, Clock, FileText } from 'lucide-react';

const PatientInfoModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Patient Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xl font-medium">
                {patient.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                patient.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-500">Patient ID: #{patient.id.slice(-5)}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                patient.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {patient.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Personal Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Age & Gender</p>
                    <p className="text-sm text-gray-600">{patient.age} years • {patient.gender}</p>
                  </div>
                </div>

                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{patient.phone}</p>
                    </div>
                  </div>
                )}

                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                  </div>
                )}

                {patient.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{patient.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Consultation Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Patient Type</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.statusColor}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Registration Date</p>
                    <p className="text-sm text-gray-600">{patient.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Query Type</p>
                    <p className="text-sm text-gray-600">{patient.queryType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Reason */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Consultation Reason</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{patient.reason}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-blue-600">12</p>
              <p className="text-xs text-blue-600">Total Consultations</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-green-600">3</p>
              <p className="text-xs text-green-600">This Month</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-orange-600">8</p>
              <p className="text-xs text-orange-600">Avg Rating</p>
            </div>
          </div>

          {/* Medical History Preview */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Recent Medical History</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Hypertension Management</span>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Routine Checkup</span>
                <span className="text-xs text-gray-500">1 week ago</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Blood Test Results</span>
                <span className="text-xs text-gray-500">2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            View Full Medical Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoModal;
