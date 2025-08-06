import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { Plus, Save, AlertTriangle, Check, Loader2, RotateCcw, ChevronDown, ChevronRight, Users, UserCheck, UserX } from "lucide-react";
import AllocationSummary from "../../components/calllog components/AllocationSummary";
import config from "../../config";

const API_URL = config.API_URL;

const DEFAULT_ROLES = [
  {
    name: "1.Consultation-Chronic",
    children: [
      "1.1 New Patients",
      "1.2 Existing Patients"
    ]
  },
  {
    name: "2.Consultation-Acute",
    children: [
      "2.1 New Patients",
      "2.2 Existing Patients"
    ]
  },
  "3.Prescription Writing",
  "4.Medicine Preparation",
  "5.Medicine and Shipment Payment Followup",
  "5.1 Medicine and Shipment Queries",
  "6.Inventory Tracking & Coordination",
  {
    name: "7.Follow ups",
    children: [
      "7.1 Follow ups-Patient Calling",
      "7.2 Follow ups-Consultation",
      "7.3 Follow ups-Consultation Payment",
      "7.4.Calling Potential patients",
    ]
  },
  "8.Follow up Queries",
  "9.Follow up Patient Care",
  "10.Information & Knowledge",
  "11.Vendor Listing",
  "12.Marketplace Queries",
  "13.Executive",
  "14.Admin Clinic",
  "15.Admin Operations"
];

const FOLLOW_UP_MAPPING = {
  "1.1 New Patients": "Follow up-Chronic-New",
  "1.2 Existing Patients": "Follow up-Chronic-Existing",
  "2.1 New Patients": "Follow up-Acute-New",
  "2.2 Existing Patients": "Follow up-Acute-Existing",
  "3.Prescription Writing": "Follow up-P",
  "4.Medicine Preparation": "Follow up-MP",
  "5.Medicine and Shipment Payment Followup": "Follow up-Mship",
  "5.1 Medicine and Shipment Queries": "Follow up-MSQ",
  "6.Inventory Tracking & Coordination": "Follow up-ITC",
  "7.1 Follow ups-Patient Calling": "Follow up-PCall",
  "7.2 Follow ups-Consultation": "Follow up-ConsultationQuery",
  "7.3 Follow ups-Consultation Payment": "Follow up-CPayment",
  "7.4.Calling Potential patients": "Follow up-Potential",
  "8.Follow up Queries": "Follow up-Queries",
  "9.Follow up Patient Care": "Follow up-PCare",
  "10.Information & Knowledge": "Follow up-Info",
  "11.Vendor Listing": "Follow up-Vendor",
  "12.Marketplace Queries": "Follow up-Marketplace",
  "13.Executive": "Follow up-Executive",
  "14.Admin Clinic": "Follow up-adminClinic",
  "15.Admin Operations": "Follow up-adminOperations"
};

const Allocation = () => {
  const [doctors, setDoctors] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [allocations, setAllocations] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState({});
  const [allocationSummary, setAllocationSummary] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debug, setDebug] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [doctorsResponse, allocationsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/assign/doctors`),
        axios.get(`${API_URL}/api/assign/allocations`)
      ]);
      const fetchedDoctors = doctorsResponse.data.map(doctor => ({
        ...doctor,
        _id: doctor._id.$oid || doctor._id // Handle both object and string IDs
      }));
      setDoctors(fetchedDoctors);
      console.log("Fetched doctors:", fetchedDoctors);

      const allocationsMap = allocationsResponse.data.reduce((acc, allocation) => {
        if (allocation.doctorId) {
          const doctorId = typeof allocation.doctorId === 'object' ? allocation.doctorId._id : allocation.doctorId;
          if (!acc[doctorId]) {
            acc[doctorId] = [];
          }
          acc[doctorId].push(allocation.role);
        }
        return acc;
      }, {});
      setAllocations(allocationsMap);
      console.log("Initial allocations:", allocationsMap);

      updateAllocationSummary(fetchedDoctors, allocationsMap);
      setError(null);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const saveAllocations = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    setDebug({});
    try {
      const allocationData = Object.entries(allocations).flatMap(([doctorId, roles]) => 
        roles.filter(role => role !== "7.Follow ups").map(role => {
          const doctor = doctors.find(d => d._id === doctorId);
          if (!doctor) {
            console.error(`Doctor not found for id: ${doctorId}`);
            setDebug(prev => ({ ...prev, notFoundDoctor: doctorId }));
            return null;
          }
          return {
            role,
            doctorId: doctorId,
            followUpType: FOLLOW_UP_MAPPING[role] || null,
            patientType: role.includes("New Patients") ? "New" : role.includes("Existing Patients") ? "Existing" : null
          };
        }).filter(Boolean)
      );

      console.log("Allocation data to be sent:", allocationData);
      setDebug(prev => ({ ...prev, allocationData }));

      const response = await axios.post(`${API_URL}/api/assign/allocations`, { allocations: allocationData });
      console.log("Server response:", response.data);
      setDebug(prev => ({ ...prev, serverResponse: response.data }));

      setSuccess(true);
      setHasChanges(false);
      const updatedAllocationsMap = response.data.allocations.reduce((acc, allocation) => {
        const doctorId = typeof allocation.doctorId === 'object' ? allocation.doctorId._id : allocation.doctorId;
        if (!acc[doctorId]) {
          acc[doctorId] = [];
        }
        acc[doctorId].push(allocation.role);
        return acc;
      }, {});
      setAllocations(updatedAllocationsMap);
      updateAllocationSummary(doctors, updatedAllocationsMap);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving allocations:", error);
      setError("Failed to save allocations. Please try again.");
      setSuccess(false);
      if (error.response) {
        console.log("Error response:", error.response.data);
        setDebug(prev => ({ ...prev, errorResponse: error.response.data }));
      }
    } finally { 
      setSaving(false);
    }
  };

  const handleAllocationChange = (role, doctorId) => {
    setAllocations(prev => {
      const newAllocations = { ...prev };
      Object.keys(newAllocations).forEach(key => {
        newAllocations[key] = newAllocations[key].filter(r => r !== role);
      });
      if (doctorId) {
        if (!newAllocations[doctorId]) {
          newAllocations[doctorId] = [];
        }
        if (!newAllocations[doctorId].includes(role)) {
          newAllocations[doctorId].push(role);
        }
        if (role === "7.Follow ups") {
          assignChildRoles(newAllocations, doctorId);
        }
      }
      console.log("Updated allocations:", newAllocations);
      return newAllocations;
    });
    setHasChanges(true);
  };

  const updateAllocationSummary = (doctors, allocationsMap) => {
    const summary = doctors.map(doctor => {
      const allocatedRoles = allocationsMap[doctor._id] || [];
      return {
        doctor: doctor.name,
        roles: allocatedRoles.length > 0 ? allocatedRoles.join(", ") : "No roles allocated",
        follow: doctor.follow || "No follows",
        role: doctor.role || "No role specified"
      };
    });
    setAllocationSummary(summary);
  };

  const assignChildRoles = (allocations, doctorId) => {
    const childRoles = [
      "7.1 Follow ups-Patient Calling",
      "7.2 Follow ups-Consultation",
      "7.3 Follow ups-Consultation Payment",
      "7.4.Calling Potential patients"
    ];

    childRoles.forEach(childRole => {
      // Remove the child role from any other doctor
      Object.keys(allocations).forEach(key => {
        allocations[key] = allocations[key].filter(r => r !== childRole);
      });

      // Assign the child role to the selected doctor
      if (!allocations[doctorId].includes(childRole)) {
        allocations[doctorId].push(childRole);
      }
    });
  };

  const handleAddRole = () => {
    const newRoleNumber = roles.length + 1;
    setRoles([...roles, `${newRoleNumber}.New Role`]);
  };

  const resetAllocations = async () => {
    try {
      await axios.delete(`${API_URL}/api/assign/allocations`);
      setAllocations({});
      setHasChanges(true);
      setShowResetConfirm(false);
      updateAllocationSummary(doctors, {});
    } catch (error) {
      setError("Failed to reset allocations. Please try again.");
    }
  };

  const toggleRoleExpansion = (role) => {
    setExpandedRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const renderRoleSelect = (role) => {
    let filteredDoctors = doctors;

    if (
      role === "1.Consultation-Chronic" ||
      role === "1.1 New Patients" ||
      role === "1.2 Existing Patients" ||
      role === "2.Consultation-Acute" ||
      role === "2.1 New Patients" ||
      role === "2.2 Existing Patients" ||
      role === "3.Prescription Writing"
    ) {
      filteredDoctors = doctors.filter(doctor => {
        return doctor.role === "admin-doctor" || doctor.role === "assistant-doctor";
      });
    }

    const selectedDoctorId = Object.entries(allocations).find(([_, roles]) => roles.includes(role))?.[0] || "";

    const isParentRole = role === "7.Follow ups";
    const isChildRole = role.startsWith("7.") && role !== "7.Follow ups";

    return (
      <select
        className={`w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all ${isChildRole ? 'bg-gray-100' : ''}`}
        value={selectedDoctorId}
        onChange={(e) => handleAllocationChange(role, e.target.value)}
        disabled={isChildRole}
      >
        <option value="">Select a doctor</option>
        {filteredDoctors.map((doctor) => (
          <option key={doctor._id} value={doctor._id}>
            {doctor.name} {doctor.follow !== "No follows" && (`(${doctor.follow})`)} {doctor.role && `[${doctor.role}]`}
          </option>
        ))}
      </select>
    );
  };

  const calculateAllocationStats = () => {
    const total = doctors.length;
    const allocated = new Set(Object.values(allocations).filter(Boolean)).size;
    const unallocated = total - allocated;

    const adminDoctors = doctors.filter(d => d.role === "admin-doctor");
    const assistantDoctors = doctors.filter(d => d.role === "assistant-doctor");
    const otherDoctors = doctors.filter(d => d.role !== "admin-doctor" && d.role !== "assistant-doctor");

    const adminAllocated = adminDoctors.filter(d => Object.values(allocations).includes(d._id)).length;
    const assistantAllocated = assistantDoctors.filter(d => Object.values(allocations).includes(d._id)).length;
    const otherAllocated = otherDoctors.filter(d => Object.values(allocations).includes(d._id)).length;

    return {
      total,
      allocated,
      unallocated,
      adminTotal: adminDoctors.length,
      adminAllocated,
      assistantTotal: assistantDoctors.length,
      assistantAllocated,
      otherTotal: otherDoctors.length,
      otherAllocated,
    };
  };

  const stats = calculateAllocationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          {children}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <DoctorLayout>
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Doctor Role Allocation</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-md flex items-center justify-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
          <button 
            onClick={saveAllocations}
            disabled={!hasChanges || saving}
            className={`
              px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-all w-full sm:w-auto
              ${hasChanges 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Allocation Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Doctors: {stats.total}</p>
            <p className="text-sm text-gray-600">Allocated: {stats.allocated}</p>
            <p className="text-sm text-gray-600">Unallocated: {stats.unallocated}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Main Doctors: {stats.adminAllocated}/{stats.adminTotal}</p>
            <p className="text-sm text-gray-600">Assistant Doctors: {stats.assistantAllocated}/{stats.assistantTotal}</p>
            <p className="text-sm text-gray-600">Other Doctors: {stats.otherAllocated}/{stats.otherTotal}</p>
          </div>
          <div>
          {(stats.adminTotal > stats.adminAllocated || stats.assistantTotal > stats.assistantAllocated) && (
            <div className="text-red-500 mb-2">
              Some admin/assistant doctors are unallocated
            </div>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full"
          >
            View Allocation Summary
          </button>
        </div>
        </div>
      </div> */}

      <AllocationSummary 
        doctors={doctors} 
        allocations={allocations}
        allocationSummary={allocationSummary}
      />      
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p>Allocations saved successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        {roles.map((role, index) => (
          <div key={index} className="bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition-colors">
            {typeof role === 'object' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleRoleExpansion(role.name)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedRoles[role.name] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <span className="text-gray-700 font-medium">{role.name}</span>
                  </div>
                  {role.name === "7.Follow ups" && (
                    <div className="w-1/2">
                      {renderRoleSelect(role.name)}
                    </div>
                  )}
                </div>
                {expandedRoles[role.name] && (
                  <div className="ml-6 space-y-2 mt-2">
                    {role.children.map((childRole, childIndex) => (
                      <div key={childIndex} className="flex items-center justify-between bg-white rounded-md p-3">
                        <span className="text-gray-700">{childRole}</span>
                        <div className="w-1/2">
                          {renderRoleSelect(childRole)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{role}</span>
                <div className="w-1/2">
                  {renderRoleSelect(role)}
                </div>
              </div>
            )}
          </div>
        ))}
        
        <button 
          onClick={handleAddRole}
          className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Role
        </button>
      </div>

      {hasChanges && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <span className="text-yellow-700 flex items-center gap-2 mb-2 sm:mb-0">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            You have unsaved changes
          </span>
          <button 
            onClick={saveAllocations}
            disabled={saving}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors w-full sm:w-auto"
          >
            {saving ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reset All Allocations?</h3>
            <p className="text-gray-600 mb-6">
              This will remove all doctor allocations. This action cannot be undone.
            </p>
            <div className="flex flex-col md:flex-row justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 w-full md:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={resetAllocations}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full md:w-auto"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
      <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Doctor-Role Allocation Summary"
    >
      <div className="py-4">
        {allocationSummary.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follows
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated Roles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allocationSummary.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.doctor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.role}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.follow}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.roles}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No allocations saved yet.</p>
        )}
      </div>
    </Modal>
    </div>
    </DoctorLayout>
  );
};

export default Allocation;