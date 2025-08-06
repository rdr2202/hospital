import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoIosSearch, IoIosWarning, IoIosHourglass } from 'react-icons/io';
import {FaUserInjured, FaUserPlus, FaFileMedical, FaPhoneAlt, FaRecordVinyl, FaCheck, FaDownload, FaPencilAlt} from 'react-icons/fa';
import config from '../../config';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CommentCell from './CommentCell';
import VideoCall from '../../pages/doctor pages/VideoCall';
import DraftViewModal from './DraftViewModal'; // Make sure the path is correct
import PrescriptionViewModal from './PrescriptionViewModal';
import MedicinePreparationView from '../../pages/doctor pages/MedicinePreparationView';

const WorkTable = () => {
  const [patients, setPatients] = useState([]);
  const [specialAllocationPatients, setSpecialAllocationPatients] = useState([]);
  const [currentDoctorId, setCurrentDoctorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [followTypes, setFollowTypes] = useState([]);
  const [selectedFollowType, setSelectedFollowType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const API_URL = config.API_URL;
  const [doctors, setDoctors] = useState([]);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const storageKey = `selectedFollowType_${userId}`;

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/assign/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors. Please try again later.");
    }
  };
  const getToken = () => {
    return localStorage.getItem('token');
  };

useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const followFromUrl = queryParams.get('follow');
  const savedFollow = localStorage.getItem(storageKey);

  if (followTypes.length === 0) return; // Wait for fetch to finish

  if (followFromUrl && followTypes.includes(followFromUrl)) {
    setSelectedFollowType(followFromUrl);
    localStorage.setItem(storageKey, followFromUrl);
  } else if (savedFollow && followTypes.includes(savedFollow)) {
    setSelectedFollowType(savedFollow);
  }
}, [location.search, followTypes]);

  const handleFollowChange = (e) => {
    const newType = e.target.value;
    setSelectedFollowType(newType);
    localStorage.setItem(storageKey, newType);
    const params = new URLSearchParams(location.search);
    params.set('follow', newType);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    fetchDoctors();
    const token = getToken();
    const userId = localStorage.getItem('userId');
    // console.log("Token:", token);
    if (token) {
      const decodedToken = jwtDecode(token);
      // console.log("decodedToken",decodedToken);
      // setUserRole(decodedToken.role); // Setting user role based on token
      setUserRole(decodedToken.user.userType);
      setCurrentDoctorId(userId);
      console.log("This is current doctor id: ", userId);
      // const decodedToken_id = "66faef2467d2c448c05a29ef";
      if (userId) {
        fetchSpecialAllocations(userId);
      }
    }
    fetchDoctorFollowTypes();
    fetchPatients();
  }, []);  

  const fetchSpecialAllocations = async (doctorId) => {
    try {
      const response = await axios.get(`${API_URL}/api/assign/special/${doctorId}`);
      setSpecialAllocationPatients(response.data);
    } catch (error) {
      console.error("Error fetching special allocations:", error);
      setError("Failed to load special allocations");
    }
  };
  
  const handleDoctorChange = async (patientId, doctorId) => {
    try {
      await axios.post(`${API_URL}/api/assign/allocations`, {
        allocations: [{ role: 'patient', doctorId, patientId }]
      });
      // Refresh the patient list or update the local state
      fetchPatients();
    } catch (error) {
      console.error("Error updating doctor allocation:", error);
      setError("Failed to update doctor allocation. Please try again.");
    }
  };
  
const fetchDoctorFollowTypes = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authorization token found');
    }

    const response = await axios.get(`${API_URL}/api/doctor/getDoctorFollow`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let followTypesArray = response.data.follow.split(', ');

    // Handle Follow up-C expansion
    if (followTypesArray.includes('Follow up-C')) {
      const index = followTypesArray.indexOf('Follow up-C');
      followTypesArray.splice(index, 1, 'Follow up-C-New', 'Follow up-C-Existing');
    }

    followTypesArray.push('Special Allocation');
    if (userRole === 'admin-doctor') {
      followTypesArray.push('View All');
    }

    setFollowTypes(followTypesArray);

    // ✅ Do not overwrite selectedFollowType if already set from URL or localStorage
    const savedFollow = localStorage.getItem(storageKey);
    const queryParams = new URLSearchParams(location.search);
    const followFromUrl = queryParams.get('follow');

    if (!followFromUrl && !savedFollow) {
      setSelectedFollowType(followTypesArray[0]);
      localStorage.setItem(storageKey, followTypesArray[0]);
    }
  } catch (error) {
    console.error('Error fetching doctor follow-up types:', error.response ? error.response.data : error.message);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};


  const fetchPatients = async () => {
    try {
      let url = `${API_URL}/api/doctor/getAllAppointmentsWithPatientData`;
      if (selectedFollowType === 'View All') {
        url = `${API_URL}/api/log/list?appointmentFixed=Yes`;
      }
      const response = await axios.get(url);
      console.log(response.data);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error.response ? error.response.data : error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedFollowType]);

  const filteredPatients = patients.filter(
    (patient) => {

      if (selectedFollowType === 'View All') {
        return true;
      }

      const isMatchingFollowType = 
        // (selectedFollowType === 'Follow up-C-New' && patient.follow === 'Follow up-C' && patient.newExisting === 'New') ||
        // (selectedFollowType === 'Follow up-C-Existing' && patient.follow === 'Follow up-C' && patient.newExisting === 'Existing') ||
        // (selectedFollowType !== 'Follow up-C-New' && selectedFollowType !== 'Follow up-C-Existing' && patient.follow === selectedFollowType);
      
        (selectedFollowType === 'Follow up-Chronic-New' && patient.medicalDetails.diseaseType.name === 'Chronic' && patient.medicalDetails.follow === 'Follow up-C' && patient.newExisting === 'New') ||
        (selectedFollowType === 'Follow up-Chronic-Existing' && patient.medicalDetails.diseaseType.name === 'Chronic' && patient.medicalDetails.follow === 'Follow up-C' && patient.newExisting === 'Existing') ||
        (selectedFollowType === 'Follow up-Acute-New' && patient.medicalDetails.diseaseType.name === 'Acute'  && patient.medicalDetails.follow === 'Follow up-C' && patient.newExisting === 'New') ||
        (selectedFollowType === 'Follow up-Acute-Existing' && patient.medicalDetails.diseaseType.name === 'Acute'  && patient.medicalDetails.follow === 'Follow up-C' && patient.newExisting === 'Existing') ||
        (selectedFollowType !== 'Follow up-Chronic-New' && selectedFollowType !== 'Follow up-Chronic-Existing' && selectedFollowType !== 'Follow up-Acute-New' && selectedFollowType !== 'Follow up-Acute-Existing' && patient.medicalDetails.follow === selectedFollowType);
// console.log("Checking patient: ",patient);
      return isMatchingFollowType &&
        (searchTerm === '' ||
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm));
    }
  );

  const navigate = useNavigate();
  const handleJoinRoom = (patient) => {
    const appointmentID = patient.medicalDetails._id;
    if (patient && patient.medicalDetails && patient.medicalDetails.meetLink) {
      navigate("/video-call", {
        state: { meetLink: patient.medicalDetails.meetLink, appointmentID },
      });
    } else {
      alert("No valid Zoom link found!");
    }
  };

  const isOneHourPassed = (followUpTimestamp) => {
    if (!followUpTimestamp) return true; // If no timestamp, enable the button
    
    const followTime = new Date(followUpTimestamp);
    const now = new Date();
    const timeDifference = now - followTime;
    
    return timeDifference >= 3600000; // 3600000 ms = 1 hour
  };

  // Helper function to get remaining time in a human-readable format
  const getRemainingTime = (followUpTimestamp) => {
    const followTime = new Date(followUpTimestamp);
    const now = new Date(); 
    const remainingMs = 3600000 - (now - followTime);
    
    if (remainingMs <= 0) return "0 minutes";
    
    const minutes = Math.floor(remainingMs / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };


  const getTableConfig = () => {
    const getActionButtons = (item) => {
      const isMshipTable = selectedFollowType === 'Follow up-Mship';
      const isVoiceCallDisabled = isMshipTable && !isOneHourPassed(item.followUpTimestamp);
      return [
        <div className="action-buttons" key="viewDraft">
          {renderButton('View draft', () => handleAction('ViewDraft', item))}
        </div>,
        <div className="action-buttons" key="videoCall">
          {renderButton('Make video call', () => handleAction('VideoCall', item))}
        </div>,
        <div className="action-buttons" key="voiceCall">
          {renderButton('Make Voice Call', () => handleAction('VoiceCall', item), isVoiceCallDisabled)}
        </div>,
        <div className="action-buttons" key="recordings">
          {renderButton('Recordings', () => handleAction('Recordings', item))}
        </div>,
        <div className="action-buttons" key="markDone">
          {renderButton('Mark Done', () => handleAction('MarkDone', item))}
        </div>
      ];
    };
    const doctorDropdown = (item) => (
      <select
        value={item.assignedDoctor || ''}
        onChange={(e) => handleDoctorChange(item._id, e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">Select a doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor._id} value={doctor._id}>
            {doctor.name}
          </option>
        ))}
      </select>
    );
    switch (selectedFollowType){
      case 'Follow up-Chronic-New':
      case 'Follow up-Chronic-Existing':
      case 'Follow up-Acute-New':
      case 'Follow up-Acute-Existing':
        return {
          head: [
            'S.no',
            'Omni channel',
            'Patient Type',
            'Who is the Consultation for',
            'Appointment Date',
            'Appointment Timing',
            'Name',
            'Phone Number',
            'Whatsapp Number',
            'Email',
            'Consulting For',
            'If diseaseType is not available',
            'Age',
            'Gender',
            'Current location',
            // 'Message sent',
            // 'Time stamp',
            'Acute/Chronic',
            'Follow',
            'Follow comment',
            'Out of network',
            'Patient profile',
            'Enquiry status',
            'App downloaded status',
            'Consultation payment',
            'Appointment fixed',
            'Medicine Payment confirmation',
            'Call attempted tracking',
            'Comments',
            'View Drafts',
            'Video Call',
            'Voice call',
            'Recordings',
            'Mark Done',
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.patientEntry || '---',
            item.newExisting || '',
            item.medicalDetails.consultingFor || '',
            item.medicalDetails.appointmentDate.split('T')[0] || '',
            item.medicalDetails.timeSlot || '',
            item.name || '',
            item.phone || '',
            item.whatsappNumber || '',
            item.email || '',
            item.medicalDetails.diseaseName || '',
            item.medicalDetails.diseaseTypeAvailable ? 'Yes' : 'No',
            item.age || '',
            item.gender || '',
            item.currentLocation || '',
            // item.medicalDetails.messageSent.message || '---',
            // item.medicalDetails.messageSent.timeStamp || '---',
            item.medicalDetails.diseaseType.name || '',
            item.medicalDetails.follow || '',
            item.medicalDetails.followComment || '',
            '--',
            item.patientProfile || 'No',
            item.medicalDetails.enquiryStatus || '',
            item.appDownload != '0' ? 'Yes' : 'No',
            item.appointmentFixed || '',
            item.appointmentFixed || '',
            item.medicinePaymentConfirmation ? 'Confirmed' : 'Pending',
            // item.callStatus || '',
            // item.conversionStatus || '',
            item.medicalDetails.callCount || '0',
            // item.comments.text || '--',
            <CommentCell 
              patient={item} 
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients(prevPatients => 
                  prevPatients.map(p => p._id === updatedPatient._id ? updatedPatient : p)
                );
              }} 
            />,
            <div className="action-buttons">
              {renderButton('View draft', () => handleAction('ViewDraft', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Make video call', () => handleAction('VideoCall', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Make Voice Call', () => handleAction('VoiceCall', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Recordings', () => handleAction('Recordings', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Mark Done', () => handleAction('MarkDone', item))}
            </div>,
          ]),
        };
      case 'Follow up-P':
        return {
          head: [
            'S.no',
            'Who is the Consultation for',
            'Patient Type',
            'Name',
            'Phone Number',
            'Email',
            'Consulting For',
            'If diseaseType is not available',
            'Age',
            'Gender',
            'Acute/Chronic',
            'Follow',
            'Follow comment',
            'Medicine Payment confirmation',
            // 'Conversion Status',
            'Call attempted tracking',
            'Comments',
            'View Drafts',
            'Attach prescription',
            'Voice call',
            'Recordings',
            'Mark Done',
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.medicalDetails.consultingFor || '',
            item.name || '',
            item.newExisting || '',
            item.phone || '',
            item.email || '',
            item.medicalDetails.consultingFor || '',
            item.medicalDetails.consultingFor || '',
            // item.diseaseTypeAvailable ? 'Yes' ? <FaCheckCircle /> : <FaTimesCircle /> : 'No',
            item.age || '',
            item.gender || '',
            item.medicalDetails.diseaseType.name || '',
            item.follow || '',
            item.medicalDetails.followComment || '',
            item.medicinePaymentConfirmation ? 'Confirmed' : 'Pending',
            // item.conversionStatus || '',
            item.medicalDetails.callCount || '',
            // '--',// item.comments.text || '--',
            <CommentCell 
              patient={item} 
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients(prevPatients => 
                  prevPatients.map(p => p._id === updatedPatient._id ? updatedPatient : p)
                );
              }} 
            />,
            
            <div className="action-buttons">
              {renderButton('View draft', () => handleAction('ViewDraft', item))}
            </div>,
            <div className="action-buttons">
              {item.medicalDetails?.prescriptionCreated ? (
                <button className="btn btn-success" disabled>Prescription written</button>
              ) : (
                renderButton('Attach prescription', () => handleAction('AttachPrescription', item))
              )}
            </div>,
            <div className="action-buttons">
                {renderButton('Make Voice Call', () => handleAction('VoiceCall', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Recordings', () => handleAction('Recordings', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Mark Done', () => handleAction('MarkDone', item))}
            </div>,
          ]),
        };
      case 'Follow up-MP':
        return {
          head: [
            'S.no',
            'Who is the Consultation for',
            'Patient Type',
            'Name',
            'Phone Number',
            'Email',
            'Consulting For',
            'If diseaseType is not available',
            'Age',
            'Gender',
            'Acute/Chronic',
            'Follow',
            'Follow comment',
            'Medicine Payment confirmation',
            'Call attempted tracking',
            'Comments',
            'View Drafts',
            'View prescription',
            'Prepare Medicine',
            'Voice call',
            'Recordings',
            'Mark Done',
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.medicalDetails.consultingFor || '',
            item.name || '',
            item.newExisting || '',
            item.phone || '',
            item.email || '',
            item.medicalDetails.consultingFor || '',
            item.medicalDetails.diseaseTypeAvailable ? 'Yes' : 'No',
            item.age || '',
            item.gender || '',
            item.medicalDetails.diseaseType.name || '',
            item.medicalDetails.follow || '',
            item.medicalDetails.followComment || '',
            item.medicinePaymentConfirmation ? 'Confirmed' : 'Pending',
            item.medicalDetails.callCount || '',
            // item.medicalDetails.comments.text || '',
            <CommentCell 
              patient={item} 
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients(prevPatients => 
                  prevPatients.map(p => p._id === updatedPatient._id ? updatedPatient : p)
                );
              }} 
            />,
            <div className="action-buttons">
              {renderButton('View draft', () => handleAction('ViewDraft', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('View prescription', () => handleAction('ViewPrescription', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Prepare Medicine', () => handleAction('PrepareMedicine', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Make Voice Call', () => handleAction('VoiceCall', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Recordings', () => handleAction('Recordings', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Mark Done', () => handleAction('MarkDone', item))} 
            </div>,
          ]),
        };
      case 'Follow up-Mship':
        return {
          head: [
            'S.no', 'Who is the Consultation for', 'Name','Patient Type', 'Phone Number',
            'Email', 'Consulting For', 'If diseaseType is not available',
            'Age', 'Gender', 'Acute/Chronic', 'Follow', 'Follow comment',
            'Medicine Payment confirmation', 'Call attempted tracking',
            'Comments', 'View Prescription', 'Voice call',
            'Recordings', 'Mark Done'
          ],
          data: filteredPatients.map((item, index) => [
            index + 1,
            item.medicalDetails.consultingFor || '',
            item.name || '',
            item.newExisting || '',
            item.phone || '',
            item.email || '',
            item.medicalDetails.consultingFor || '',
            item.medicalDetails.diseaseTypeAvailable ? 'Yes' : 'No',
            item.age || '',
            item.gender || '',
            item.medicalDetails.diseaseType.name || '',
            item.medicalDetails.follow || '',
            item.medicalDetails.followComment || '',
            item.medicinePaymentConfirmation ? 'Confirmed' : 'Pending',
            item.medicalDetails.callCount || '',
            // item.comments.text || '--',
            // <CommentCell patient={item} onCommentAdded={handleCommentAdded} />,
            <CommentCell 
              patient={item} 
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients(prevPatients => 
                  prevPatients.map(p => p._id === updatedPatient._id ? updatedPatient : p)
                );
              }} 
            />,
            <div className="action-buttons">
                {renderButton('View Prescription', () => handleAction('ViewPrescription', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Make Voice Call', () => handleAction('VoiceCall', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Recordings', () => handleAction('Recordings', item))}
            </div>,
            <div className="action-buttons">
                {renderButton('Mark Done', () => handleAction('MarkDone', item))} 
            </div>,
          ]),
        };
      case 'View All':
        return {
        head: [
          'S.no',
          'Omni channel',
          'Patient Type',
          'Who is the Consultation for',
          'Name',
          'Phone Number',
          'Whatsapp Number',
          'Email',
          'Consulting For',
          'If diseaseType is not available',
          'Age',
          'Gender',
          'Current location',
          // 'Message sent',
          // 'Time stamp',
          'Acute/Chronic',
          'Follow',
          'Follow comment',
          'Out of network',
          'Patient profile',
          'Enquiry status',
          'App downloaded status',
          'Consultation payment',
          'Appointment fixed',
          'Medicine Payment confirmation',
          'Call attempted tracking',
          'Comments',
          'View Allocations',
          'View Drafts',
          'Video Call',
          'Voice call',
          'Recordings',
          'Mark Done',
        ],
        data: filteredPatients.map((item, index) => [
          index + 1,
          item.patientEntry || '---',
          item.newExisting || '',
          item.medicalDetails.consultingFor || '',
          item.name || '',
          item.phone || '',
          item.whatsappNumber || '',
          item.email || '',
          item.medicalDetails.diseaseName || '',
          item.medicalDetails.diseaseTypeAvailable ? 'Yes' : 'No',
          item.age || '',
          item.gender || '',
          item.currentLocation || '',
          // item.medicalDetails.messageSent.message || '---',
          // item.medicalDetails.messageSent.timeStamp || '---',
          item.medicalDetails.diseaseType.name || '',
          item.medicalDetails.follow || '',
          item.medicalDetails.followComment || '',
          '--',
          item.patientProfile || 'No',
          item.medicalDetails.enquiryStatus || '',
          item.appDownload != '0' ? 'Yes' : 'No',
          item.appointmentFixed || '',
          item.appointmentFixed || '',
          item.medicalDetails.medicalPayment ? 'Confirmed' : 'Pending',
          // item.callStatus || '',
          // item.conversionStatus || '',
          item.medicalDetails.callCount || '0',
          // item.medicalDetails.comments.text || '--',
          <CommentCell 
              patient={item} 
              API_URL={API_URL}
              onCommentAdded={(updatedPatient) => {
                setPatients(prevPatients => 
                  prevPatients.map(p => p._id === updatedPatient._id ? updatedPatient : p)
                );
              }} 
            />,
          doctorDropdown(item),
          <div className="action-buttons">
            {renderButton('View draft', () => handleAction('ViewDraft', item))}
          </div>,
          <div className="action-buttons">
              {renderButton('Make video call', () => handleAction('VideoCall', item))}
          </div>,
          <div className="action-buttons">
              {renderButton('Make Voice Call', () => handleAction('VoiceCall', item))}
          </div>,
          <div className="action-buttons">
              {renderButton('Recordings', () => handleAction('Recordings', item))}
          </div>,
          <div className="action-buttons">
              {renderButton('Mark Done', () => handleAction('MarkDone', item))}
          </div>,
        ]),
      };
      case 'Special Allocation':
        return {
          head: [
            'S.no',
            'Omni channel',
            'Patient Type',
            'Who is the Consultation for',
            'Name',
            'Phone Number',
            'Whatsapp Number',
            'Email',
            'Consulting For',
            'If diseaseType is not available',
            'Age',
            'Gender',
            'Current location',
            // 'Message sent',
            // 'Time stamp',
            'Acute/Chronic',
            'Follow',
            'Follow comment',
            'Out of network',
            'Patient profile',
            'Enquiry status',
            'App downloaded status',
            'Consultation payment',
            'Appointment fixed',
            'Medicine Payment confirmation',
            'Call attempted tracking',
            'Comments',
            'View Drafts',
            'Video Call',
            'Voice call',
            'Recordings',
            'Mark Done',
          ],
          data: specialAllocationPatients.length > 0 ? 
            specialAllocationPatients.map((item, index) => [
              index + 1,
              item.patientEntry || '---',
              item.newExisting || '',
              item.medicalDetails.consultingFor || '',
              item.name || '',
              item.phone || '',
              item.whatsappNumber || '',
              item.email || '',
              item.medicalDetails.diseaseName || '',
              item.medicalDetails.diseaseTypeAvailable ? 'Yes' : 'No',
              item.age || '',
              item.gender || '',
              item.currentLocation || '',
              // item.medicalDetails.messageSent?.message || '---',
              // item.medicalDetails.messageSent?.timeStamp || '---',
              item.medicalDetails.diseaseType?.name || '',
              item.medicalDetails.follow || '',
              item.medicalDetails.followComment || '',
              '--',
              item.patientProfile || 'No',
              item.medicalDetails.enquiryStatus || '',
              item.appDownload != '0' ? 'Yes' : 'No',
              item.appointmentFixed || '',
              item.appointmentFixed || '',
              item.medicalDetails.medicalPayment ? 'Confirmed' : 'Pending',
              item.medicalDetails.callCount || '0',
              item.medicalDetails.comments?.text || '--',
              <div className="action-buttons">
                {renderButton('View draft', () => handleAction('ViewDraft', item))}
              </div>,
              <div className="action-buttons">
                {renderButton('Make video call', () => handleAction('VideoCall', item))}
              </div>,
              <div className="action-buttons">
                {renderButton('Make Voice Call', () => handleAction('VoiceCall', item))}
              </div>,
              <div className="action-buttons">
                {renderButton('Recordings', () => handleAction('Recordings', item))}
              </div>,
              <div className="action-buttons">
                {renderButton('Mark Done', () => handleAction('MarkDone', item))}
              </div>,
            ]) : [[
              <td colSpan="31" className="text-center py-4">
                No special allocations found
              </td>
            ]]
        };
        default:
        return { head: [], data: [] };
    }
  };

  const renderButton = (text, onPress, disabled = false) => (
    <button
      onClick={disabled ? null : onPress}
      disabled={disabled}
      className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded-[5px] 
                  transition-all duration-300 ${
                    disabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'text-[#f5f5f5] bg-[#1a237e] hover:bg-[#534bae] border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae]'
                  }`}
    >
      {text}
    </button>
  );

  

  const handleAction = async (action, item) => {
    const isMshipTable = selectedFollowType === 'Follow up-Mship';
    
    if (isMshipTable && action === 'VoiceCall' && !isOneHourPassed(item.followUpTimestamp)) {
      const remainingTime = getRemainingTime(item.followUpTimestamp);
      alert(`Voice call will be available in ${remainingTime}`);
      return;
    }
    switch (action) {
      case 'ViewDraft':
        // alert(`Viewing draft for ${item.name}`);
        setSelectedPatient(item);
        setIsDraftModalOpen(true);
        break;
      case 'VideoCall':
        alert(`Starting video call with ${item.name}`);
        handleJoinRoom(item);
        break;
      case 'VoiceCall':
        alert(`Calling ${item.phone}`);
        break;
      case 'Recordings':
        alert(`Viewing recordings for ${item.name}`);
        break;
      case 'AttachPrescription':
        // alert(`Attaching prescription for ${item.name}`);
        const d = localStorage.getItem('accessToken');
        console.log("d", d);
        navigate('/prescription-writing', { 
          state: { 
            patientData: item
          }
        });
        break;
      case 'ViewPrescription':
        const appointmentId = item.medicalDetails._id;
        setModalContent(
          <PrescriptionViewModal
            isOpen={true}
            onClose={() => setShowModal(false)}
            appointmentId={appointmentId}
          />
        );
        setShowModal(true);
        break;
      case 'PrepareMedicine':
        const appointment_Id = item.medicalDetails._id;
        navigate(`/prepare-medicine/${appointment_Id}`);
        break;
      case 'MarkDone':
        try {
          const response = await axios.put(`${API_URL}/api/patient/updateFollowUp/${item.medicalDetails._id}`);
          alert('Follow-up status updated for ' + item.name);
          fetchPatients();
        } catch (error) {
          console.error('Error updating follow-up status:', error);
          alert('Failed to update follow-up status');
        }
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-indicator">
        <IoIosHourglass size={48} color="#FF5722" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-indicator">
        <IoIosWarning size={48} color="#FF5722" />
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  const tableConfig = getTableConfig();

  return (
    <div className="w-full px-2 py-4">
      <div className="mb-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoIosSearch className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-blue-800 rounded-lg"
          />
        </div>

        <select value={selectedFollowType} onChange={handleFollowChange}>
          {followTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-blue-800 text-white">
            <tr>
              {tableConfig.head.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableConfig.data.length > 0 ? (
              tableConfig.data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="border-b hover:bg-blue-50"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableConfig.head.length}
                  className="px-4 py-3 text-center text-gray-500"
                >
                  No patients found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DraftViewModal 
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        patientData={selectedPatient}
      />
      {showModal && modalContent}
    </div>
  );
};

export default WorkTable;