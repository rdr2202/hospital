import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaPhoneAlt, FaRecordVinyl, FaEye, FaDownload, FaPencilAlt, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import CallInterface from './CallInterface';
import RecordingsInterface from './RecordingsButton';
// import '../css/AssistantDashboard.css';
import config from '../../config';
import CommentCell from './CommentCell';
import DoctorAllocationCell from './DoctorAllocationComponent';
import RecordingsButton from './RecordingsButton';
const AttemptBucket = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('attempt1');
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [currentRecordings, setCurrentRecordings] = useState(null);
  const [showRecordingsInterface, setShowRecordingsInterface] = useState(false);
  const [followUpStatuses, setFollowUpStatuses] = useState({});
  const [patientFormsStatus, setPatientFormsStatus] = useState({});
  const [doctorNames, setDoctorNames] = useState({});
  const [activeSection, setActiveSection] = useState(1);
  const tableRef = useRef(null);

  const API_URL = config.API_URL;

  useEffect(() => {
    const fetchPatientsAndFormStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/log/list`);
        const patientsData = response.data
          .filter(patient => patient.appointmentFixed !== 'Yes') // Only get patients without fixed appointments
          .map(patient => ({
            ...patient,
            callCount: patient.medicalDetails.callCount || 0, // Ensure callCount exists
            diseaseType: typeof patient.medicalDetails.diseaseType === 'string' 
              ? { name: patient.medicalDetails.diseaseType, isEdited: false }
              : patient.medicalDetails.diseaseType || { name: '', isEdited: false }
          }));

        // Fetch follow-up statuses
        const followUpPromises = patientsData.map(patient => 
          axios.get(`http://${API_URL}:5000/api/log/follow-up/${patient._id}`)
        );
        const followUpResponses = await Promise.all(followUpPromises);
        const followUpStatusObj = {};
        followUpResponses.forEach((res, index) => {
          followUpStatusObj[patientsData[index]._id] = res.data.followUpStatus;
        });

        // Fetch form statuses
        const formStatusPromises = patientsData.map(patient => 
          axios.get(`http://${API_URL}:5000/api/log/patientProfile/${patient.phone}`)
        );
        const formStatusResponses = await Promise.all(formStatusPromises);
        const formStatusObj = {};
        formStatusResponses.forEach((res, index) => {
          formStatusObj[patientsData[index]._id] = res.data.message;
        });

        // Fetch doctor names
        const doctorIds = patientsData.map(patient => patient.currentAllocDoc).filter(Boolean);
        const uniqueDoctorIds = [...new Set(doctorIds)];
        const doctorPromises = uniqueDoctorIds.map(id => 
          axios.get(`http://${API_URL}:5000/api/doctor/byId/${id}`)
        );
        const doctorResponses = await Promise.all(doctorPromises);
        const doctorNamesObj = {};
        doctorResponses.forEach(res => {
          if (res.data && res.data.name) {
            doctorNamesObj[res.data._id] = res.data.name;
          }
        });

        setPatients(patientsData);
        setFollowUpStatuses(followUpStatusObj);
        setPatientFormsStatus(formStatusObj);
        setDoctorNames(doctorNamesObj);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPatientsAndFormStatus();
  }, []);

  // Updated filtering logic
  const filteredPatients = patients.filter(patient => {
    const searchMatch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toString().includes(searchTerm);

    const callCount = patient.medicalDetails.callCount || 0;
    
    // Updated attempt filtering logic
    const attemptMatch = 
      (filterOption === 'attempt1' && callCount === 1) ||
      (filterOption === 'attempt2' && callCount === 2) ||
      (filterOption === 'attempt3' && callCount >= 3);

    return searchMatch && attemptMatch;
  });

  const prioritizePatients = (patientsList) => {
    return patientsList.sort((a, b) => {
      const priorityMap = {
        "Follow up-Mship": 1,
        "Follow up-C": 2,
        "Follow up-PCall": 3,
        "Follow up-Potential": 4,
        "Follow up-PCare": 5,
      };

      const getPriority = (patient) => {
        if (patient.follow === 'Follow up-Mship' && patient.medicalPayment === 'no') return 1;
        if (patient.follow === 'Follow up-C' && patient.appointmentFixed === 'no') return 2;
        return priorityMap[patient.follow] || 6;
      };

      return getPriority(a) - getPriority(b);
    });
  };


  const makeCall = async (patient) => {
    try {
      const callResponse = await axios.post('https://f9ea-122-15-77-226.ngrok-free.app/make-call', {
        to: patient.phone,
      });
      
      if (callResponse.status === 200) {
        const countResponse = await axios.post(`http://${API_URL}:5000/api/log/increment-call-count/${patient._id}`);
        if (countResponse.status === 200) {
          setPatients(prevPatients => prevPatients.map(p =>
            p._id === patient._id ? countResponse.data.patient : p
          ));
          setCurrentCall(patient);
          window.alert('Call initiated and call count incremented successfully!');
        } else {
          console.error('Failed to increment call count:', countResponse.data);
        }
      } else {
        console.error('Failed to initiate call:', callResponse.data);
      }
    } catch (error) {
      console.error('Error making call or incrementing call count:', error.response ? error.response.data : error.message);
    }
  };

  const endCall = () => {
    setShowCallInterface(false);
    setCurrentCall(null);
  };

  const viewRecordings = async (patient) => {
    window.alert('Coming Soon !');
  };

  const closeRecordings = () => {
    setShowRecordingsInterface(false);
    setCurrentRecordings(null);
  };

  const sendMessage = async (patient) => {
    try {
      const response = await axios.post(`http://${API_URL}:5000/api/log/send-message/${patient._id}`);
      if (response.status === 200) {
        setPatients(prevPatients => prevPatients.map(p =>
          p._id === patient._id
            ? { ...p, messageSent: { status: true, timeStamp: new Date().toISOString() } }
            : p
        ));
        console.log('Message sent successfully:', response.data);
      } else {
        console.error('Failed to send message:', response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };
  
  const getCallStatus = (patient) => {
    if (!patient || typeof patient.medicalDetails.enquiryStatus === 'undefined') {
      return 'Unknown';
    }

    const enquiryStatus = patient.medicalDetails.enquiryStatus ? patient.medicalDetails.enquiryStatus.trim() : '';
    const appointmentFixed = patient.appointmentFixed === 'Yes';
    const medicalPayment = patient.medicalDetails.medicalPayment === 'Yes';

    console.log('Patient ID:', patient._id);
    console.log('Enquiry Status:', enquiryStatus);
    console.log('Appointment Fixed:', appointmentFixed);
    
    if(appointmentFixed && medicalPayment) {
      return 'Completed';
    } else if(enquiryStatus === 'Not Interested') {
      return 'Lost';
    } else {
      return 'In-Progress';
    }
  };

  const handleEnquiryStatusChange = async (patientId, newStatus) => {
    try {
      const response = await axios.put(`http://${API_URL}:5000/api/log/update-status/${patientId}`, {
        enquiryStatus: newStatus
      });

      if (response.status === 200) {
        setPatients(prevPatients => prevPatients.map(p => 
          p._id === patientId ? { ...p, enquiryStatus: newStatus } : p
        ));
        console.log('Enquiry status updated successfully:', newStatus);
      } else {
        console.error('Failed to update enquiry status:', response.data);
      }
    } catch (error) {
      console.error('Error updating enquiry status:', error.response ? error.response.data : error.message);
    }
  };

  const [editingDiseaseType, setEditingDiseaseType] = useState(null);
  const handleEditDiseaseType = async (patientId, newDiseaseTypeName) => {
    try {
        const token = localStorage.getItem('token');
        console.log("Token:",token);
        const response = await axios.put(`http://${API_URL}:5000/api/log/update-disease-type/${patientId}`, {
            diseaseType: {
                name: newDiseaseTypeName,
                edit: true,
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}` // Set the bearer token
            }
        });

        if (response.data.success) {
            setPatients(prevPatients => prevPatients.map(p =>
                p._id === patientId ? { ...p, diseaseType: response.data.patient.medicalDetails.diseaseType } : p
            ));
            setEditingDiseaseType(null);
        } else {
            console.error('Failed to update disease type');
        }
    } catch (error) {
        console.error('Error updating disease type:', error);
    }
  };  

  const sections = [
    {
      id: 1,
      title: "Patient Information & Consultation Details",
      columns: ["S.No","Patient Type", "Who is the Consultation for", "Name", "Phone Number", "Whatsapp Number", "Age", "Email", "Gender", "Current Location", "Consulting For","If disease type is not available", "Acute / Chronic", "Patient Profile", "Enquiry Status"]
    },
    {
      id: 2,
      title: "Communication & Interaction Channels",
      columns: ["Role and Activity Status", "Messenger Comment", "Omni Channel", "Message Sent","Time Stamp", "Make a Call", "Recordings", "Follow up Comments", "Out of network"]
    },
    {
      id: 3,
      title: "Client Status & Tracking",
      columns: ["appDownload", "Call Status", "Call Attempted tracking", "Conversion Status"]
    },
    {
      id: 4,
      title: "Appointment & Payment",
      columns: ["Consultation payment","Appointment Fixed", "Medicine & Shipping Payment confirmation", "Role Allocations"]
    }
  ];

  const TableHeader = () => (
    <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#1a237e]">Attempt Bucket</h2>
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center">
          <div className="flex items-center bg-white rounded-l-lg border-2 border-r-0 border-[#1a237e] focus-within:border-[#534bae] transition-colors duration-300">
            <FaSearch className="ml-3 text-[#1a237e]" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-2 w-64 outline-none text-[#212121]"
            />
          </div>
        </div>
        <select
          className="p-2 border-2 border-[#1a237e] rounded-lg outline-none text-[#212121] bg-white hover:border-[#534bae] transition-colors duration-300 cursor-pointer"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option value="attempt1">Attempt 1</option>
          <option value="attempt2">Attempt 2</option>
          <option value="attempt3">Attempt 3 or more</option>
        </select>
      </div>
    </div>
  );

  const [activeTab, setActiveTab] = useState(1);
  
  const toggleSection = (sectionId) => {
    if (sectionId === activeTab) {
      setVisibleSections(prev => 
        prev.filter(id => id !== sectionId)
      );
      setActiveTab(null);
    } else {
      setVisibleSections([sectionId]);
      setActiveTab(sectionId);
    }
  };

  const scrollToSection = (sectionId) => {
    const sectionIndex = sections.findIndex(section => section.id === sectionId);
    if (sectionIndex !== -1 && tableRef.current) {
      const columnWidth = 150; // Adjust this value based on your actual column width
      const scrollPosition = sectionIndex * sections[sectionIndex].columns.length * columnWidth;
      tableRef.current.scrollLeft = scrollPosition;
    }
    setActiveSection(sectionId);
  };

  const TabSwitcher = () => (
    <div className="flex justify-around space-x-4 mb-4 mx-2 overflow-x-auto">
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
        className={`flex-grow px-4 py-2 rounded-lg transition-colors duration-200 text-center whitespace-nowrap ${
            activeSection === section.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {section.title}
        </button>
      ))}
    </div>
  );

  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {sections.flatMap(section => section.columns).map((column, index) => (
          <th
            key={index}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderTableBody = () => (
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredPatients.map((patient, index) => (
        <tr key={patient._id} className="hover:bg-[#f5f5f5] transition-colors duration-200">
          {sections.flatMap(section => section.columns).map(column => (
            <td key={column} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {renderCellContent(patient, column, index)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );


  const renderCellContent = (patient, column, index) => {
    switch (column) {
      case "S.No":
        return index + 1;
      case "Patient Type":
        return patient.newExisting || '---';
      case "Who is the Consultation for":
        return patient.medicalDetails.consultingFor || '---';
      case "Name":
        return patient.name;
      case "Phone Number":
        return patient.phone;
      case "Whatsapp Number":
        return patient.whatsappNumber || '---';
      case "Age":
        return patient.age || '---';
      case "Email":
        return patient.email || '---';
      case "Gender":
        return patient.gender || '---';
      case "Current Location":
        return patient.currentLocation || '---';
      case "Consulting For":
        return patient.medicalDetails.diseaseName || '---';
      case "If disease type is not available":
        return patient.medicalDetails.diseaseName || '---';
      case "Acute / Chronic":
        return (
          <div>
            {editingDiseaseType === patient._id ? (
              <select
                value={patient.medicalDetails?.diseaseType?.name || ''}  // Optional chaining here
                onChange={(e) => handleEditDiseaseType(patient._id, e.target.value)}
                onBlur={() => setEditingDiseaseType(null)}
                autoFocus
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Acute">Acute</option>
                <option value="Chronic">Chronic</option>
              </select>
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${patient.medicalDetails?.diseaseType?.edit ? 'text-blue-600' : 'text-gray-700'}`}>
                  {patient.medicalDetails?.diseaseType?.name || 'Not specified'}  {/* Optional chaining */}
                </span>
                <button 
                  onClick={() => setEditingDiseaseType(patient._id)}
                  className="text-gray-500 hover:text-blue-600 focus:outline-none"
                >
                  <FaPencilAlt size={14} />
                </button>
              </div>
            )}
            {patient.diseaseType?.edit && patient.diseaseType.editedby && (
              <div className="mt-1 text-xs text-gray-500">
                Edited by: {patient.diseaseType.editedby}
              </div>
            )}
          </div>
        );   
      case "Patient Profile":
        return patientFormsStatus[patient._id] || 'Loading...';
      case "Enquiry Status":
        return (
          <select
            value={patient.medicalDetails.enquiryStatus || ''}
            onChange={(e) => handleEnquiryStatusChange(patient._id, e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Select status</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            {/* <option value="Follow Up">Follow Up</option> */}
          </select>
        );
      case "Role and Activity Status":
        return patient.medicalDetails.follow || '---';
      case "Messenger Comment":
        return patient.medicalDetails.followComment || '---';
      case "Omni Channel":
        return patient.patientEntry || '---';
      case "Message Sent":
        // return patient.messageSent?.status ? 'Yes' : 'No';
        return patient.medicalDetails.messageSent?.status ? (
          "Sent"
        ) : (
          <button
            className="send-message-button"
            onClick={() => sendMessage(patient)}
          >
            Send Message
          </button>
        );
      case "Time Stamp":
        return patient.medicalDetails.messageSent?.timeStamp;
      case "Make a Call":
        return (
          <button 
            onClick={() => makeCall(patient)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#1a237e] hover:bg-[#000051] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae] transition-all duration-300"
          >
            <FaPhoneAlt className="mr-2 -ml-0.5 h-4 w-4" /> Make Call
          </button>
        );
      case "Recordings":
        return (
          // <button
          //   onClick={() => viewRecordings(patient)}
          //   className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#1a237e] hover:bg-[#000051] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae] transition-all duration-300"
          // >
          //   <FaRecordVinyl className="mr-2 -ml-0.5 h-4 w-4" /> View Recordings
          // </button>
          <div>
                  <RecordingsButton patient={patient} />
          </div>
        );
      case "Follow up Comments":
        return <CommentCell 
          patient={patient} 
          API_URL={API_URL}
          onCommentAdded={(updatedPatient) => {
            setPatients(prevPatients => 
              prevPatients.map(p => p._id === updatedPatient._id ? updatedPatient : p)
            );
          }} 
        />;
      case "Out of network":
        return patient.outOfNetwork || '---';
      case "appDownload":
        return patient.appDownload != '0' ? <FaDownload className='green' /> : <FaTimesCircle className='red' />;
      case "Call Status":
        return getCallStatus(patient);
      case "Call Attempted tracking":
        return patient.medicalDetails.callCount || 0;
      case "Conversion Status":
        return patient.appointmentFixed === 'Yes' ? <FaCheckCircle className='green' /> : <FaTimesCircle className='red' />;
      case "Consultation payment":
        return patient.appointmentFixed === 'Yes' ? <FaCheckCircle className='green' /> : <FaTimesCircle className='red' />;
      case "Appointment Fixed":
        return patient.appointmentFixed === 'Yes' ? <FaCheckCircle className='green' /> : <FaTimesCircle className='red' />;
      case "Medicine & Shipping Payment confirmation":
        return patient.medicalPayment === 'Yes' ? <FaCheckCircle className='green' /> : <FaTimesCircle className='red' />;
      case "Role Allocation":
        return (
          <DoctorAllocationCell 
            patient={patient}
            currentDoctor={getDoctorForPatient(patient)}
            onAllocationChange={(newDoctor) => {
              setIndividualAllocations(prev => ({
                ...prev,
                [patient._id]: newDoctor
              }));
            }}
          />
        );
      default:
        return '---';
    }
  };
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Attempt Bucket</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="attempt1">Attempt 1</option>
            <option value="attempt2">Attempt 2</option>
            <option value="attempt3">Attempt 3 or more</option>
          </select>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                {renderTableHeader()}
                {renderTableBody()}
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {showCallInterface && <CallInterface patient={currentCall} onClose={endCall} />}
      {showRecordingsInterface && <RecordingsInterface recordings={currentRecordings} onClose={closeRecordings} />}
    </div>
  );
};

export default AttemptBucket;