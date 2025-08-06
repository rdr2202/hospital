import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt } from 'react-icons/fa'; // Corrected import for FaPencilAlt
import config from '../../config';

const DoctorAllocationCell = ({ patient, currentDoctor, onAllocationChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [doctors, setDoctors] = useState([]);
    const API_URL = config.API_URL;

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/assign/doctors`);
                setDoctors(response.data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctors();
    }, [API_URL]);

    const handleIndividualAllocation = async (patientId, doctorId) => {
        try {
            const response = await axios.post(`${API_URL}/api/assign/individual-allocation`, {
                patientId,
                doctorId
            });
            
            if (response.status === 200) {
                // Notify parent component of the change
                if (onAllocationChange) {
                    onAllocationChange(response.data.doctor);
                }
                return response.data.doctor;
            }
        } catch (error) {
            console.error('Error allocating doctor:', error);
            throw error;
        }
    };

    const handleAllocation = async () => {
        if (selectedDoctor) {
            try {
                await handleIndividualAllocation(patient._id, selectedDoctor);
                setIsEditing(false);
            } catch (error) {
                console.error('Failed to allocate doctor:', error);
                // Optionally add error handling UI here
            }
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2">
                <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleAllocation}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    Save
                </button>
                <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <span>{currentDoctor}</span>
            <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-blue-600 focus:outline-none"
            >
                <FaPencilAlt size={14} />
            </button>
        </div>
    );
};

export default DoctorAllocationCell;