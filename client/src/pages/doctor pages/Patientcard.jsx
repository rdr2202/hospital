import React, { useEffect, useState } from 'react';
import patientprofile from '/src/assets/images/doctor images/patientprofile.jpg';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientCard = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/log/list', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatients(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPatients();
  }, []);

  const confirm = (id) => {
    navigate(`/patients/viewdetails/${id}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div className="bg-blue-50">
        <div className="container mx-auto p-4">
          <div className="mb-4 flex justify-between">
            <input
              type="text"
              className="border rounded p-2 w-full max-w-xs"
              placeholder="Search by Patient's Name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPatients.map((patient, index) => (
              <button key={index} onClick={() => confirm(patient._id)}>
                <div className="bg-white shadow-md rounded-lg p-4 text-center">
                  <img
                    src={patientprofile}
                    alt={patient.name}
                    className="w-24 h-24 mx-auto rounded-full mb-4"
                  />
                  <h3 className="text-xl font-bold">{patient.name}</h3>
                  <p>Patient ID: {patient._id}</p>
                  <p>Age: {patient.age}</p>
                  <p>Last Visit: N/A</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default PatientCard;
