import React, { useState, useEffect } from 'react';
import config from '../../config';
const API_URL = config.API_URL;

const AddDoctorModal = ({ isOpen, onClose, employeeID, refreshDoctors, doctor }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    phone: "",
    secondaryContact: "",
    personalEmail: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactNumber: "",
    // Job Details
    employeeID: "",
    role: "",
    department: "",
    dateOfJoining: "",
    employmentType: "",
    workLocation: "",
    reportingManager: "",
    workShift: "",
    // Compensation Details
    basicSalary: "",
    allowances: "",
    deductions: "",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
    paymentFrequency: "",
    pfNumber: "",
    esiNumber: "",
    taxDeductionPreferences: "",
    usernameSystemAccess: "",
    temporaryPassword: "",
    accessLevel: "",
    digitalSignature: null,
    highestQualification: "",
    specialization: "",
    yearOfGraduation: "",
    previousEmployer: "",
    previousDuration: "",
    previousJobRole: "",
    totalExperience: "",
    certifications: "",
    medicalRegistrationNumber: "",
    documents: [],
});

// Fetch the generated Employee ID when adding a new doctor (not in edit mode)
useEffect(() => {
  if (!doctor) {  // Only fetch employee ID if doctor is not provided (i.e., new employee)
    async function fetchemployeeID() {
      try {
        const response = await fetch(`${API_URL}/api/employees/generate-employee-id`);
        const data = await response.json();
        if (data.success) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            employeeID: data.employeeID, // Set the generated ID
          }));
        }
      } catch (error) {
        console.error("Failed to fetch Employee ID:", error);
      }
    }
    fetchemployeeID();
  }
}, [doctor]); // This will run when doctor is null or undefined (i.e., when adding a new doctor)

// Update form data when doctor changes
useEffect(() => {
    if (doctor) {
        setFormData((prevState) => ({
            ...prevState,
            ...doctor,
            digitalSignature: doctor.digitalSignature || null,
            documents: doctor.documents || [],
        }));
    }
}, [doctor]);

const formatDateToDDMMYYYY = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

   // Fetch employee data when editing
   useEffect(() => {
    if (doctor) {
      const fetchEmployeeData = async () => {
        try {
          const response = await fetch(`${API_URL}/api/employees/getEmployeeById/${doctor.employeeID}`);
          const data = await response.json();
          if (data.success) {
            const employee = data.data;
            setFormData((prevFormData) => ({
              ...prevFormData,
              ...employee,
              dateOfBirth: employee.dateOfBirth
                ? new Date(employee.dateOfBirth).toISOString().split("T")[0] // Format to yyyy-mm-dd
                : "",
              dateOfJoining: employee.dateOfJoining
                ? new Date(employee.dateOfJoining).toISOString().split("T")[0] // Format to yyyy-mm-dd
                : "",
            }));
          }
        } catch (error) {
                console.error("Error fetching employee details:", error);
            }
        };

        fetchEmployeeData();
    } else {
        // Reset form for adding a new employee
        setFormData({
             // Personal Information
    name: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    phone: '',
    secondaryContact: '',
    personalEmail: '',
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
// Job Details
employeeID: '',
role: '',
department: '',
dateOfJoining: '',
employmentType: '',
workLocation: '',
reportingManager: '',
workShift: '',
// Compensation Details
basicSalary: '',
allowances: '',
deductions: '',
bankAccountNumber: '',
bankName: '',
ifscCode: '',
paymentFrequency: '',
pfNumber: '',
esiNumber: '',
taxDeductionPreferences: '',
usernameSystemAccess: '',
    temporaryPassword: '',
    accessLevel: '',
    digitalSignature: null,
    highestQualification: '',
    specialization: '',
    yearOfGraduation: '',
    previousEmployer: '',
    previousDuration: '',
    previousJobRole: '',
    totalExperience: '',
    certifications: '',
    medicalRegistrationNumber: '',
    documents: []  
        });
    }
}, [doctor, employeeID]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "documents") {
      setFormData({ ...formData, documents: files });
    } else if (name === "digitalSignature") {
      setFormData({ ...formData, digitalSignature: files[0] });
    }
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map((file) => ({
      name: file.name,
      uploaded: false, // Initially set to false
    }));
    
    // Update the state with the new documents
    setUploadedDocuments((prev) => [...prev, ...newDocuments]);
  };
  
  // Handle document removal
  const handleRemoveDocument = (index) => {
    const updatedDocuments = [...uploadedDocuments];
    updatedDocuments.splice(index, 1); // Remove the document at the given index
    setUploadedDocuments(updatedDocuments);
  };
  
  // Update upload status for a document
  const markDocumentAsUploaded = (index) => {
    const updatedDocuments = [...uploadedDocuments];
    updatedDocuments[index].uploaded = true; // Set uploaded status to true
    setUploadedDocuments(updatedDocuments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Create a new FormData object
    const formDataToSend = new FormData();

    // Append text fields (formData) to FormData
    Object.keys(formData).forEach((key) => {
        // Skip files here, they'll be appended separately
        if (key !== "documents" && key !== "digitalSignature") {
            formDataToSend.append(key, formData[key]);
        }
    });

    // Append the digital signature (if provided)
    if (formData.digitalSignature) {
        formDataToSend.append("digitalSignature", formData.digitalSignature);
    }

    // Append the documents (if any)
    if (formData.documents && formData.documents.length > 0) {
        Array.from(formData.documents).forEach((doc) => {
            formDataToSend.append(documents, doc); // Append as 'documents[]'
        });
    }

      // Append employee data as a stringified JSON
    formDataToSend.append("employeeData", JSON.stringify(formData));

    console.log("FormData to send:", formDataToSend);

    try {
        // Determine if it's an add or update operation
        const isUpdate = doctor && doctor.employeeID; // Check if 'doctor' object and ID exist

        const url = isUpdate
            ? `${API_URL}/api/employees/updateEmployee/${doctor.employeeID}`
            : `${API_URL}/api/employees/add`;

        const method = isUpdate ? "PUT" : "POST";

        // Make the API request
        const response = await fetch(url, {
            method,
            body: formDataToSend, // FormData auto-handles headers for file uploads
        });

        if (response.ok) {
            const data = await response.json();
            alert(isUpdate ? "Profile updated successfully!" : "Profile created successfully!");
            console.log(data);

            // Optionally refresh the form/UI after success
            if (isUpdate) {
              fetchUpdatedEmployeeData(doctor.employeeID); // Fetch updated data
            } else if (typeof refreshDoctors === "function") {
              refreshDoctors(); // Refresh list after new entry
            }
    
            if (typeof onClose === "function") {
              onClose(); // Close modal
            }

        } else {
            // Handle server errors
            const errorData = await response.json();
            alert( `Error: ${errorData.message || "Something went wrong!"}`);
        }
    } catch (error) {
        console.error("Error in form submission:", error);
        alert("An unexpected error occurred. Please try again.");
    }
};

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="container max-h-[80vh] overflow-y-auto mx-auto p-6 bg-white rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold mb-6">Add Employee</h2>
        <form onSubmit={handleSubmit}>
          
            {/* Other fields from the previous sections */}
             {/* Personal Information */}
             <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Full Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Nationality"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Primary Contact *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Primary Contact"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Secondary Contact</label>
              <input
                type="tel"
                name="secondaryContact"
                value={formData.secondaryContact}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Secondary Contact"
                
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Personal Email Address *</label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Current Address *</label>
              <input
                type="text"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Current Address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Permanent Address</label>
              <input
                type="text"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Permanent Address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Emergency Contact Name *</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Emergency Contact Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Emergency Contact Relationship *</label>
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Relationship"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Emergency Contact Number *</label>
              <input
                type="tel"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Emergency Contact Number"
                required
              />
            </div>
            </div>

            {/* Job Details */}
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Employee ID</label>
              <input
                type="text"
                name="employeeID"
                value={formData.employeeID}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Designation Job Title</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Designation</option>
                <option value="Senior Doctor">Senior Doctor</option>
                <option value="Doctor">Doctor</option>
                <option value="assistant-doctor">assistant-doctor</option>
                <option value="Executive">Executive</option>
                <option value="Admin- Clinic">Admin- Clinic</option>
                <option value="Admin- Operations">Admin- Operations</option>
                <option value="External Doctor">External Doctor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Department</option>
                <option value="Medical">Medical</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Date of Joining *</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contractual">Contractual</option>
                
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Work Location</label>
              <select
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Work Location</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Reporting Manager *</label>
              <input
                type="text"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Reporting Manager"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Work Shift/Hours</label>
              <select
                name="workShift"
                value={formData.workShift}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Work Shift</option>
                <option value="Morning Shift">Morning</option>
                <option value="Evening Shift">Evening</option>
                <option value="Night Shift">Night</option>
                <option value=" Flexible Hours"> Flexible Hours</option>
                
              </select>
            </div>
            </div>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Compensation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div>
  <label className="block text-sm font-medium">Basic Salary *</label>
  <input
    type="text"
    name="basicSalary"
    value={formData.basicSalary}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Basic Salary"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Allowances *</label>
  <input
    type="text"
    name="allowances"
    value={formData.allowances}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Allowances"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Deductions *</label>
  <input
    type="text"
    name="deductions"
    value={formData.deductions}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Deductions"
    required
  />
</div>
<div>
  <label className="block text-sm font-medium">Bank Account Number *</label>
  <input
    type="text"
    name="bankAccountNumber"
    value={formData.bankAccountNumber}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Bank Account Number"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Bank Name & Branch *</label>
  <input
    type="text"
    name="bankName"
    value={formData.bankName}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Bank Name and Branch"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">IFSC Code *</label>
  <input
    type="text"
    name="ifscCode"
    value={formData.ifscCode}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter IFSC Code"
    required
  />
</div>


<div>
<label className="block text-sm font-medium">Payment Frequency *</label>
  <select
    name="paymentFrequency"
    value={formData.paymentFrequency}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    required
  >
    <option value="">Select Payment Frequency</option>
    <option value="Monthly">Monthly</option>
    <option value="Bi-weekly">Bi-weekly</option>
  </select>
</div>

<div>
  <label className="block text-sm font-medium">PF Number</label>
  <input
    type="text"
    name="pfNumber"
    value={formData.pfNumber}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter PF Number"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">ESI Number</label>
  <input
    type="text"
    name="esiNumber"
    value={formData.esiNumber}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter ESI Number"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium">Tax Deduction Preferences</label>
  <input
    type="text"
    name="taxDeductionPreferences"
    value={formData.taxDeductionPreferences}
    onChange={handleChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    placeholder="Enter Tax Deduction Preferences"
    required
  />
</div>
</div>

   {/* Educational and Professional Background */}
            <h3 className="col-span-2 text-xl font-semibold mt-6 mb-6">Educational and Professional Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Educational fields */}
            <div>
              <label className="block text-sm font-medium">Highest Qualification *</label>
              <input
                type="text"
                name="highestQualification"
                value={formData.highestQualification}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Highest Qualification"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Specialization (if any)</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Specialization"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Year of Graduation *</label>
              <input
                type="text"
                name="yearOfGraduation"
                value={formData.yearOfGraduation}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Year of Graduation"
                required
              />
            </div>

            {/* Previous Employer Details */}
            <h4 className="col-span-2 text-sm font-semibold mt-6 mb-6">Previous Employer Details</h4>

            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input
                type="text"
                name="previousEmployer"
                value={formData.previousEmployer}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Company Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Duration</label>
              <input
                type="text"
                name="previousDuration"
                value={formData.previousDuration}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Duration"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Job Role</label>
              <input
                type="text"
                name="previousJobRole"
                value={formData.previousJobRole}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter Job Role"
                required
              />
            </div>

            <div>
            <label className="block text-sm font-medium">Total Years of Experience *</label>
            <input
              type="number"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Total Years of Experience"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium">Professional Certifications</label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Certifications"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium">Medical Registration Number (for medical staff)</label>
            <input
              type="text"
              name="medicalRegistrationNumber"
              value={formData.medicalRegistrationNumber}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter Registration Number"
              required
            />
          </div>
          </div>

            {/* Documents Upload Section */}
      

<div className="col-span-2">
  <label className="block text-lg font-medium">Documents Upload</label>
  <input
    type="file"
    name="documents"
    accept='application/pdf'
    multiple
    onChange={handleFileChange}
    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
  />
</div>

{/* Display Uploaded Documents */}
<div className="col-span-2 mt-2">
  {uploadedDocuments.length > 0 && (
    <ul className="space-y-2">
      {uploadedDocuments.map((doc, index) => (
        <li key={index} className="flex items-center justify-between p-2 border border-gray-300 rounded-lg">
          <span className="flex items-center">
            {doc.uploaded && <span className="text-green-500 mr-2">✓</span>} {/* Tick mark */}
            {doc.name}
          </span>
          <div className="flex items-center">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700 mr-4"
              onClick={() => markDocumentAsUploaded(index)} // Mark as uploaded
            >
              Upload
            </button>
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleRemoveDocument(index)}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

 {/* System Access and Credentials */}
 <h3 className="col-span-2 text-xl font-semibold mt-6 mb-6">System Access and Credentials</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-medium">Username(System Access) *</label>
    <input
      type="text"
      name="usernameSystemAccess"
      value={formData.usernameSystemAccess}
      onChange={handleChange}
      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
      placeholder="Enter Username"
      required
    />
  </div>

  <div>
      <label className="block text-sm font-medium">Temporary Password *</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"} // Toggle input type
          name="temporaryPassword"
          value={formData.temporaryPassword}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Enter Temporary Password"
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-3 text-sm text-gray-600 hover:text-blue-500"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>

  <div>
    <label className="block text-sm font-medium">Role-based Access Level *</label>
    <select
      name="accessLevel"
      value={formData.accessLevel}
      onChange={handleChange}
      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
      required
    >
      <option>Select Access Level</option>
      <option>Admin</option>
      <option>Doctor</option>
      <option>Assistant Doctor</option>
      <option>Support Staff</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium">Digital Signature</label>
    <input
      type="file"
      name="digitalSignature"
        accept='application/pdf'
      onChange={handleFileChange}
      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
    />
  </div>
</div>


<div className="flex justify-end mt-6">
<button
  type="button"
  onClick={onClose}
  className="px-4 py-2 mr-4 bg-gray-500 text-white rounded-md"
>
  Cancel
</button>
<button
  type="submit"
  onClick={handleSubmit}
  className="px-4 py-2 bg-blue-600 text-white rounded-md"
>
  {doctor ? "Update Profile" : "Create Profile"}
</button>

</div>
</form>
</div>
</div>

);
};

export default AddDoctorModal;
